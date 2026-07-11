import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { resolveWorkspaceAccountId } from '@/lib/tenant';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
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

    const section = await db.contentSection.findUnique({
      where: { id },
      include: { page: { select: { accountId: true } } },
    });

    if (!section || section.page.accountId !== accountId) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const updated = await db.contentSection.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ section: updated });
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

    const section = await db.contentSection.findUnique({
      where: { id },
      include: { page: { select: { accountId: true } } },
    });

    if (!section || section.page.accountId !== accountId) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    await db.contentSection.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}