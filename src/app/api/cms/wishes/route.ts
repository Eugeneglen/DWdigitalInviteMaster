import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

async function getWeddingId(userId: string): Promise<string | null> {
  const w = await db.weddingAccount.findFirst({ where: { ownerId: userId }, select: { id: true } });
  return w?.id ?? null;
}

// GET /api/cms/wishes?search=xxx
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { weddingId };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { message: { contains: search } },
        { relationship: { contains: search } },
      ];
    }

    const wishes = await db.wish.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ wishes, total: wishes.length });
  } catch (error) {
    console.error('Get wishes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cms/wishes?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.wish.findFirst({
      where: { id, weddingId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Wish not found' }, { status: 404 });
    }

    await db.wish.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        weddingId,
        action: 'DELETE',
        entity: 'Wish',
        entityId: id,
        details: JSON.stringify({ name: existing.name }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete wish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}