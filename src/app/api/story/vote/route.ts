import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const voteSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  voterName: z.string().min(1, 'Your name is required'),
});

async function getDefaultTenantId(): Promise<string> {
  const tenant = await db.tenant.findFirst({ where: { status: 'active' } });
  if (!tenant) throw new Error('No active tenant found');
  return tenant.id;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = voteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { destination, voterName } = parsed.data;
    const tenantId = await getDefaultTenantId();

    const existing = await db.honeymoonVote.findFirst({
      where: { destination, voterName, tenantId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already voted for this destination' },
        { status: 409 }
      );
    }

    await db.honeymoonVote.create({
      data: { tenantId, destination, voterName },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}