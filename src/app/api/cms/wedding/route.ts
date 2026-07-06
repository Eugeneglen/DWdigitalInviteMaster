import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/cms/wedding — get the couple's own wedding account
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wedding = await db.weddingAccount.findFirst({
      where: { ownerId: session.user.id },
      include: {
        features: true,
        content: true,
        schedules: { orderBy: { sortOrder: 'asc' } },
        stories: { orderBy: { sortOrder: 'asc' } },
        faqs: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        media: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { rsvps: true, wishes: true, guests: true, contacts: true } },
      },
    });

    if (!wedding) {
      return NextResponse.json({ error: 'No wedding account found' }, { status: 404 });
    }

    return NextResponse.json({ wedding });
  } catch (error) {
    console.error('Get wedding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/cms/wedding — update wedding account details
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const wedding = await db.weddingAccount.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!wedding) {
      return NextResponse.json({ error: 'No wedding account found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['coupleName', 'brideName', 'groomName', 'weddingDate', 'weddingTime', 'venue', 'venueAddress', 'googleMapsUrl', 'heroImageUrl', 'bannerUrl'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = field === 'weddingDate' ? new Date(body[field]) : body[field];
      }
    }

    const updated = await db.weddingAccount.update({
      where: { id: wedding.id },
      data: updateData,
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        weddingId: wedding.id,
        action: 'UPDATE',
        entity: 'WeddingAccount',
        entityId: wedding.id,
        details: JSON.stringify(Object.keys(updateData)),
      },
    });

    return NextResponse.json({ wedding: updated });
  } catch (error) {
    console.error('Update wedding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}