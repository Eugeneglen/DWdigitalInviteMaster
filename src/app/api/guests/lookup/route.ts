import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/guests/lookup?code=XXX
// Public endpoint — no auth required — for guests to look up their invitation
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: 'Invitation code is required' },
        { status: 400 }
      );
    }

    const guest = await db.guest.findUnique({
      where: { invitationCode: code.trim().toUpperCase() },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        groupName: true,
        tableNumber: true,
        plusOne: true,
        plusOneName: true,
        dietaryNotes: true,
        rsvpStatus: true,
        weddingId: true,
      },
    });

    if (!guest) {
      return NextResponse.json(
        { error: 'Invitation not found. Please check your code and try again.' },
        { status: 404 }
      );
    }

    // If already responded, include that info
    if (guest.rsvpStatus && guest.rsvpStatus !== 'PENDING') {
      return NextResponse.json({
        found: true,
        alreadyResponded: true,
        rsvpStatus: guest.rsvpStatus,
        guest: {
          name: guest.name,
          email: guest.email,
          groupName: guest.groupName,
          tableNumber: guest.tableNumber,
          plusOne: guest.plusOne,
          plusOneName: guest.plusOneName,
          dietaryNotes: guest.dietaryNotes,
          weddingId: guest.weddingId,
        },
      });
    }

    // Derive party size from plusOne
    const partySize = guest.plusOne ? 2 : 1;

    return NextResponse.json({
      found: true,
      alreadyResponded: false,
      guest: {
        name: guest.name,
        email: guest.email,
        partySize,
        plusOne: guest.plusOne,
        plusOneName: guest.plusOneName,
        dietaryNotes: guest.dietaryNotes,
        groupName: guest.groupName,
        tableNumber: guest.tableNumber,
        weddingId: guest.weddingId,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}