import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

async function getWeddingId(userId: string): Promise<string | null> {
  const w = await db.weddingAccount.findFirst({ where: { ownerId: userId }, select: { id: true } });
  return w?.id ?? null;
}

// GET /api/cms/rsvps?status=attending
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    const rsvps = await db.rSVPSubmission.findMany({
      where: { weddingId },
      include: {
        guests: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Client-side status filtering based on guest responses
    let filtered = rsvps;
    if (statusFilter) {
      filtered = rsvps.filter((rsvp) => {
        const responses = rsvp.guests;
        if (responses.length === 0) return false;
        const allYes = responses.every((g) => g.attendance === 'yes');
        const allNo = responses.every((g) => g.attendance === 'no');
        if (statusFilter === 'attending') return allYes;
        if (statusFilter === 'declined') return allNo;
        if (statusFilter === 'mixed') return !allYes && !allNo;
        return true;
      });
    }

    return NextResponse.json({ rsvps: filtered, total: rsvps.length });
  } catch (error) {
    console.error('Get RSVPs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}