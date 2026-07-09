import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { resolveWorkspaceAccountId } from '@/lib/tenant';
import { z } from 'zod';

const updateSchema = z.object({
  value: z.string().optional(),
  meta: z.string().nullable().optional(),
  key: z.string().min(1).optional(),
  type: z.enum(['text', 'richtext', 'image', 'gallery', 'timeline-item', 'faq-item', 'venue-info', 'map-embed']).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const accountId = await resolveWorkspaceAccountId(session?.user?.id);

    if (!accountId) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const block = await db.contentBlock.findUnique({
      where: { id },
      include: {
        section: {
          include: { page: { select: { accountId: true } } },
        },
      },
    });

    if (!block || block.section.page.accountId !== accountId) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    const updated = await db.contentBlock.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ block: updated });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const accountId = await resolveWorkspaceAccountId(session?.user?.id);

    if (!accountId) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    const { id } = await params;

    const block = await db.contentBlock.findUnique({
      where: { id },
      include: {
        section: {
          include: { page: { select: { accountId: true } } },
        },
      },
    });

    if (!block || block.section.page.accountId !== accountId) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    await db.contentBlock.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}