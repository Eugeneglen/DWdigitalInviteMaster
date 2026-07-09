import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { resolveWorkspaceAccountId } from '@/lib/tenant';

export async function POST(request: Request) {
  const session = await getServerSession();
  const accountId = await resolveWorkspaceAccountId(session?.user?.id);

  if (!accountId) {
    return NextResponse.json({ error: 'No account found' }, { status: 404 });
  }

  let body: { pageSlug: string; publish: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body.pageSlug !== 'string' || typeof body.publish !== 'boolean') {
    return NextResponse.json(
      { error: 'pageSlug (string) and publish (boolean) are required' },
      { status: 400 }
    );
  }

  const updatedPage = await db.contentPage.update({
    where: {
      accountId_slug: {
        accountId,
        slug: body.pageSlug,
      },
    },
    data: {
      isPublished: body.publish,
      publishedAt: body.publish ? new Date() : null,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      isPublished: true,
      publishedAt: true,
    },
  });

  return NextResponse.json({ page: updatedPage });
}