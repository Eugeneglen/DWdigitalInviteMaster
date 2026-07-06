import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

async function getWeddingId(userId: string): Promise<string | null> {
  const w = await db.weddingAccount.findFirst({ where: { ownerId: userId }, select: { id: true } });
  return w?.id ?? null;
}

// GET /api/cms/features — get all features for couple's wedding
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const features = await db.weddingFeature.findMany({
      where: { weddingId },
      orderBy: { featureKey: 'asc' },
    });
    return NextResponse.json({ features });
  } catch (error) {
    console.error('Get features error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/cms/features — toggle features (couple can only toggle what Dreamweavers has enabled)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const { features } = await req.json() as { features: { featureKey: string; isEnabled: boolean }[] };

    if (!Array.isArray(features)) {
      return NextResponse.json({ error: 'features array required' }, { status: 400 });
    }

    const results = [];
    for (const f of features) {
      const existing = await db.weddingFeature.findFirst({
        where: { weddingId, featureKey: f.featureKey },
      });
      if (existing) {
        const updated = await db.weddingFeature.update({
          where: { id: existing.id },
          data: { isEnabled: f.isEnabled },
        });
        results.push(updated);
      }
    }

    return NextResponse.json({ features: results });
  } catch (error) {
    console.error('Update features error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}