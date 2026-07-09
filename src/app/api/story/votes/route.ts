import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function getDefaultTenantId(): Promise<string> {
  const tenant = await db.tenant.findFirst({ where: { status: 'active' } });
  if (!tenant) throw new Error('No active tenant found');
  return tenant.id;
}

export async function GET() {
  try {
    const tenantId = await getDefaultTenantId();

    const voteCounts = await db.honeymoonVote.groupBy({
      by: ['destination'],
      where: { tenantId },
      _count: { destination: true },
      orderBy: { _count: { destination: 'desc' } },
    });

    const destinations = voteCounts.map((v) => ({
      name: v.destination,
      votes: v._count.destination,
    }));

    const suggestions = await db.honeymoonSuggestion.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        suggestedBy: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ destinations, suggestions });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}