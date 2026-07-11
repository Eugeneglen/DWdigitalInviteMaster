import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weddingSlug: string; pageSlug: string }> }
) {
  const { weddingSlug, pageSlug } = await params

  const account = await db.account.findUnique({
    where: { slug: weddingSlug },
    select: { id: true },
  })

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const page = await db.contentPage.findUnique({
    where: {
      accountId_slug: {
        accountId: account.id,
        slug: pageSlug,
      },
    },
    select: {
      slug: true,
      title: true,
      isPublished: true,
      sections: {
        orderBy: { sortOrder: 'asc' },
        select: {
          slug: true,
          title: true,
          blocks: {
            orderBy: { sortOrder: 'asc' },
            select: {
              key: true,
              type: true,
              value: true,
              meta: true,
            },
          },
        },
      },
    },
  })

  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  if (!page.isPublished) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  return NextResponse.json({
    page: { slug: page.slug, title: page.title },
    sections: page.sections,
  })
}