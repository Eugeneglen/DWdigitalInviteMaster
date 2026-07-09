import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { resolveWorkspaceAccountId } from '@/lib/tenant';
import { z } from 'zod';

const createSectionSchema = z.object({
  pageSlug: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const accountId = await resolveWorkspaceAccountId(session?.user?.id);

    if (!accountId) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get('pageSlug');

    if (!pageSlug) {
      return NextResponse.json(
        { error: 'pageSlug query parameter is required' },
        { status: 400 }
      );
    }

    const page = await db.contentPage.findUnique({
      where: { accountId_slug: { accountId, slug: pageSlug } },
      select: { id: true },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const sections = await db.contentSection.findMany({
      where: { pageId: page.id },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        sortOrder: true,
        _count: { select: { blocks: true } },
      },
    });

    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const accountId = await resolveWorkspaceAccountId(session?.user?.id);

    if (!accountId) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createSectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { pageSlug, slug, title } = parsed.data;

    const page = await db.contentPage.findUnique({
      where: { accountId_slug: { accountId, slug: pageSlug } },
      select: { id: true, sections: { select: { sortOrder: true }, orderBy: { sortOrder: 'desc' }, take: 1 } },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const existingSection = await db.contentSection.findFirst({
      where: { pageId: page.id, slug },
    });

    if (existingSection) {
      return NextResponse.json(
        { error: 'A section with this slug already exists on this page' },
        { status: 409 }
      );
    }

    const nextSortOrder = (page.sections[0]?.sortOrder ?? -1) + 1;

    const section = await db.contentSection.create({
      data: {
        pageId: page.id,
        slug,
        title,
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json({ section }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}