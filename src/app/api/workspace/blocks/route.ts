import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { resolveWorkspaceAccountId } from '@/lib/tenant';
import { z } from 'zod';

const createBlockSchema = z.object({
  sectionId: z.string().min(1),
  key: z.string().min(1),
  type: z.enum(['text', 'richtext', 'image', 'gallery', 'timeline-item', 'faq-item', 'venue-info', 'map-embed']),
  value: z.string().default(''),
  meta: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const accountId = await resolveWorkspaceAccountId(session?.user?.id);

    if (!accountId) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createBlockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { sectionId, key, type, value, meta } = parsed.data;

    const section = await db.contentSection.findUnique({
      where: { id: sectionId },
      include: {
        page: {
          select: {
            accountId: true,
            sections: {
              where: { id: sectionId },
              select: { blocks: { select: { sortOrder: true }, orderBy: { sortOrder: 'desc' }, take: 1 } },
            },
          },
        },
      },
    });

    if (!section || section.page.accountId !== accountId) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const existing = await db.contentBlock.findFirst({
      where: { sectionId, key },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A block with this key already exists in this section' },
        { status: 409 }
      );
    }

    const nextSortOrder = (section.page.sections[0]?.blocks[0]?.sortOrder ?? -1) + 1;

    const block = await db.contentBlock.create({
      data: {
        sectionId,
        key,
        type,
        value: value ?? '',
        meta: meta ?? null,
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}