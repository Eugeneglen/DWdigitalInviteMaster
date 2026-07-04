import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const wishSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = wishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, relationship, message } = parsed.data;

    const wish = await db.wish.create({
      data: {
        name,
        relationship: relationship || null,
        message,
      },
    });

    return NextResponse.json({ success: true, id: wish.id });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const wishes = await db.wish.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ wishes });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}