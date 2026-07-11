import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Count totals
    const totalRsvps = await db.rSVPSubmission.count();

    const guestCountResult = await db.rSVPSubmission.aggregate({
      _sum: { partySize: true },
    });
    const totalGuests = guestCountResult._sum.partySize || 0;

    const totalWishes = await db.wish.count();

    const totalContacts = await db.contactSubmission.count();

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

    // Latest 5 contact submissions
    const recentContacts = await db.contactSubmission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      totalRsvps,
      totalGuests,
      totalWishes,
      totalContacts,
      recentRsvps,
      recentWishes,
      recentContacts,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}