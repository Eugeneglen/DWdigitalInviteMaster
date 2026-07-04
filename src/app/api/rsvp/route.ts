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

    const { firstName, lastName, partySize, guests } = parsed.data;

    const submission = await db.rSVPSubmission.create({
      data: {
        firstName,
        lastName,
        partySize,
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

    return NextResponse.json({ success: true, id: submission.id });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}