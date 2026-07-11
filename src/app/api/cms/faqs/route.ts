import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod/v4';

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

async function getWeddingId(userId: string): Promise<string | null> {
  const w = await db.weddingAccount.findFirst({ where: { ownerId: userId }, select: { id: true } });
  return w?.id ?? null;
}

// GET
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const faqs = await db.fAQ.findMany({
      where: { weddingId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('Get FAQs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const body = await req.json();
    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

    const maxSort = await db.fAQ.aggregate({ where: { weddingId }, _max: { sortOrder: true } });
    const faq = await db.fAQ.create({
      data: { weddingId, ...parsed.data, sortOrder: parsed.data.sortOrder ?? ((maxSort._max.sortOrder ?? 0) + 1) },
    });
    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    console.error('Create FAQ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'FAQ ID required' }, { status: 400 });

    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });
    const existing = await db.fAQ.findFirst({ where: { id, weddingId } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const faq = await db.fAQ.update({ where: { id }, data: updates });
    return NextResponse.json({ faq });
  } catch (error) {
    console.error('Update FAQ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'FAQ ID required' }, { status: 400 });

    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });
    const existing = await db.fAQ.findFirst({ where: { id, weddingId } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await db.fAQ.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}