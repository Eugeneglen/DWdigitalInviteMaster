import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  contact: z.string().optional(),
  reason: z.string().min(1, 'Reason for contact is required'),
  weddingId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, contact, reason, weddingId } = parsed.data;

    // Validate weddingId if provided
    if (weddingId) {
      const wedding = await db.weddingAccount.findUnique({
        where: { id: weddingId },
        select: { id: true },
      });
      if (!wedding) {
        return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
      }
    }

    const submission = await db.contactSubmission.create({
      data: {
        name,
        email,
        contact: contact || null,
        reason,
        weddingId: weddingId || null,
      },
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}