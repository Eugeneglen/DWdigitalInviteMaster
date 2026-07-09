import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { resolveWorkspaceAccountId } from '@/lib/tenant';

export async function GET() {
  try {
    const session = await getServerSession();
    const accountId = await resolveWorkspaceAccountId(session?.user?.id);

    if (!accountId) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    // Get account info
    const account = await db.account.findUnique({ where: { id: accountId } });
    if (!account) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    // Get all pages with sections and blocks (for CMS editor)
    const pages = await db.contentPage.findMany({
      where: { accountId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        isPublished: true,
        publishedAt: true,
        sections: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            sortOrder: true,
            blocks: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                key: true,
                type: true,
                value: true,
                meta: true,
                sortOrder: true,
              },
            },
          },
        },
      },
    });

    // Get counts for stats
    const rsvpCount = await db.rSVPSubmission.count({ where: { accountId } });
    const wishesCount = await db.wish.count({ where: { accountId } });
    const mediaCount = await db.mediaAsset.count({ where: { accountId } });

    return NextResponse.json({
      accountName: `${account.coupleName1} & ${account.coupleName2}`,
      accountSlug: account.slug,
      accountStatus: account.status,
      weddingDate: account.weddingDate,
      plan: account.plan,
      stats: {
        pagesPublished: pages.filter((p) => p.isPublished).length,
        totalPages: pages.length,
        rsvpCount,
        wishesCount,
        mediaCount,
      },
      pages,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}