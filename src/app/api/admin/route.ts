import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Count total RSVPs
    const totalRsvps = await db.rSVPSubmission.count();

    // Sum total guests (partySize)
    const guestCountResult = await db.rSVPSubmission.aggregate({
      _sum: { partySize: true },
    });
    const totalGuests = guestCountResult._sum.partySize || 0;

    // Count total wishes
    const totalWishes = await db.wish.count();

    // Latest 5 RSVPs with guest info
    const recentRsvps = await db.rSVPSubmission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        guests: true,
      },
    });

    // Latest 5 wishes
    const recentWishes = await db.wish.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      totalRsvps,
      totalGuests,
      totalWishes,
      recentRsvps,
      recentWishes,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}