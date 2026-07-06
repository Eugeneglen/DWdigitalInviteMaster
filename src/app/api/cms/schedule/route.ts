import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod/v4';

const scheduleSchema = z.object({
  eventType: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().min(1),
  endTime: z.string().optional(),
  location: z.string().optional(),
  sortOrder: z.number().optional(),
});

async function getWeddingId(userId: string): Promise<string | null> {
  const w = await db.weddingAccount.findFirst({ where: { ownerId: userId }, select: { id: true } });
  return w?.id ?? null;
}

// GET /api/cms/schedule
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const schedules = await db.eventSchedule.findMany({
      where: { weddingId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cms/schedule — add a schedule item
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const body = await req.json();
    const parsed = scheduleSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

    const maxSort = await db.eventSchedule.aggregate({
      where: { weddingId },
      _max: { sortOrder: true },
    });

    const schedule = await db.eventSchedule.create({
      data: {
        weddingId,
        ...parsed.data,
        sortOrder: parsed.data.sortOrder ?? ((maxSort._max.sortOrder ?? 0) + 1),
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/cms/schedule — update a schedule item
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });

    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const existing = await db.eventSchedule.findFirst({ where: { id, weddingId } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const schedule = await db.eventSchedule.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cms/schedule?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });

    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const existing = await db.eventSchedule.findFirst({ where: { id, weddingId } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await db.eventSchedule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}