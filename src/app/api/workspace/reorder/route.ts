import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { resolveWorkspaceAccountId } from '@/lib/tenant';
import { z } from 'zod';

const reorderSectionsSchema = z.object({
  type: z.literal('sections'),
  pageSlug: z.string().min(1),
  order: z.array(z.object({ id: z.string(), sortOrder: z.number() })).min(1),
});

const reorderBlocksSchema = z.object({
  type: z.literal('blocks'),
  sectionId: z.string().min(1),
  order: z.array(z.object({ id: z.string(), sortOrder: z.number() })).min(1),
});

const reorderPagesSchema = z.object({
  type: z.literal('pages'),
  order: z.array(z.object({ id: z.string(), sortOrder: z.number() })).min(1),
});

const reorderBody = z.discriminatedUnion('type', [
  reorderPagesSchema,
  reorderSectionsSchema,
  reorderBlocksSchema,
]);

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const accountId = await resolveWorkspaceAccountId(session?.user?.id);

    if (!accountId) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = reorderBody.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid reorder payload. Expected type: "pages" | "sections" | "blocks"' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.type === 'pages') {
      const pages = await db.contentPage.findMany({
        where: { accountId, id: { in: data.order.map((o) => o.id) } },
        select: { id: true },
      });

      const pageIds = new Set(pages.map((p) => p.id));
      for (const item of data.order) {
        if (!pageIds.has(item.id)) {
          return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
      }

      await db.$transaction(
        data.order.map((item) =>
          db.contentPage.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );

      return NextResponse.json({ success: true });
    }

    if (data.type === 'sections') {
      const page = await db.contentPage.findUnique({
        where: { accountId_slug: { accountId, slug: data.pageSlug } },
        select: { id: true },
      });

      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }

      await db.$transaction(
        data.order.map((item) =>
          db.contentSection.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );

      return NextResponse.json({ success: true });
    }

    if (data.type === 'blocks') {
      const section = await db.contentSection.findUnique({
        where: { id: data.sectionId },
        include: { page: { select: { accountId: true } } },
      });

      if (!section || section.page.accountId !== accountId) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }

      await db.$transaction(
        data.order.map((item) =>
          db.contentBlock.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown reorder type' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}