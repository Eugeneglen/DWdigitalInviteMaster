import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weddingSlug: string }> }
) {
  const { weddingSlug } = await params

  const account = await db.account.findUnique({
    where: { slug: weddingSlug },
    select: {
      id: true,
      coupleName1: true,
      coupleName2: true,
      slug: true,
    },
  })

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const pages = await db.contentPage.findMany({
    where: {
      accountId: account.id,
      isPublished: true,
    },
    orderBy: { sortOrder: 'asc' },
    select: {
      slug: true,
      title: true,
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

  return NextResponse.json(
    {
      account: {
        id: account.id,
        coupleName1: account.coupleName1,
        coupleName2: account.coupleName2,
        slug: account.slug,
      },
      pages,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  )
}