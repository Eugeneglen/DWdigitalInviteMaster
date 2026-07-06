import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const guestSchema = z.object({
  name: z.string().min(1),
  attendance: z.string().default('yes'),
  dietary: z.string().optional(),
});

const rsvpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  partySize: z.number().int().min(1).max(10),
  guests: z.array(guestSchema).min(1, 'At least one guest is required'),
  weddingId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = rsvpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { firstName, lastName, partySize, guests, weddingId } = parsed.data;

    // Validate weddingId if provided
    if (weddingId) {
      const wedding = await db.weddingAccount.findUnique({
        where: { id: weddingId },
        select: { id: true, status: true },
      });
      if (!wedding) {
        return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
      }
      if (wedding.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Wedding is not accepting RSVPs' }, { status: 400 });
      }
    }

    const submission = await db.rSVPSubmission.create({
      data: {
        firstName,
        lastName,
        partySize,
        weddingId: weddingId || null,
        guests: {
          create: guests.map((g) => ({
            name: g.name,
            attendance: g.attendance,
            dietary: g.dietary || null,
          })),
        },
      },
      include: { guests: true },
    });

    // If weddingId is provided, update the linked guest's rsvpStatus if matched
    if (weddingId) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.toLowerCase();
      const matchingGuest = await db.guest.findFirst({
        where: {
          weddingId,
          AND: [
            {
              OR: [
                { name: { contains: firstName.trim(), mode: 'insensitive' } },
                { email: { contains: firstName.trim(), mode: 'insensitive' } },
              ],
            },
          ],
          rsvpStatus: 'PENDING',
        },
      });
      if (matchingGuest) {
        const hasAttendance = guests.some(
          (g) => g.attendance === 'yes' || g.attendance === 'partial'
        );
        await db.guest.update({
          where: { id: matchingGuest.id },
          data: {
            rsvpStatus: hasAttendance ? 'ATTENDING' : 'DECLINED',
            openedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ success: true, id: submission.id });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}