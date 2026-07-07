import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod/v4';

const createWeddingSchema = z.object({
  coupleName: z.string().min(2),
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  weddingDate: z.string(),
  weddingTime: z.string().optional(),
  venue: z.string().optional(),
  venueAddress: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  plan: z.enum(['FREE', 'PREMIUM', 'ENTERPRISE']).default('FREE'),
  sections: z.array(z.string()).optional(), // optional nav sections to enable
});

// GET /api/master/weddings — list all weddings with pagination
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const plan = searchParams.get('plan') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { coupleName: { contains: search } },
        { brideName: { contains: search } },
        { groomName: { contains: search } },
        { slug: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (plan) where.plan = plan;

    const [weddings, total] = await Promise.all([
      db.weddingAccount.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { rsvps: true, wishes: true, guests: true, contacts: true } },
        },
      }),
      db.weddingAccount.count({ where }),
    ]);

    return NextResponse.json({ weddings, total, page, limit });
  } catch (error) {
    console.error('Weddings list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/master/weddings — create a new wedding account
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createWeddingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const data = parsed.data;
    const slug = data.coupleName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + data.weddingDate.split('T')[0];

    // Check slug uniqueness
    const existing = await db.weddingAccount.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'A wedding with a similar name and date already exists' }, { status: 409 });
    }

    const wedding = await db.weddingAccount.create({
      data: {
        slug,
        coupleName: data.coupleName,
        brideName: data.brideName,
        groomName: data.groomName,
        weddingDate: new Date(data.weddingDate),
        weddingTime: data.weddingTime,
        venue: data.venue,
        venueAddress: data.venueAddress,
        googleMapsUrl: data.googleMapsUrl,
        plan: data.plan,
        status: 'DRAFT',
      },
    });

    // Create features — default sections ON, optional sections controlled by `sections` param
    const requestedSections: string[] = data.sections ?? [];
    const defaultFeatures = [
      'countdown', 'schedule', 'rsvp', 'getting-there', 'music',
      'story', 'wishes', 'qa', 'moments', 'gallery',
    ];
    const optionalFeatureKeys = ['story', 'wishes', 'qa', 'moments'];
    await db.weddingFeature.createMany({
      data: defaultFeatures.map((key) => ({
        weddingId: wedding.id,
        featureKey: key,
        isEnabled: optionalFeatureKeys.includes(key)
          ? requestedSections.includes(key)
          : true,
      })),
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'WeddingAccount',
        entityId: wedding.id,
        details: JSON.stringify({ coupleName: data.coupleName, plan: data.plan }),
      },
    });

    return NextResponse.json({ wedding }, { status: 201 });
  } catch (error) {
    console.error('Wedding create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/master/weddings — update a wedding account
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updates } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Wedding ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (updates.coupleName) updateData.coupleName = updates.coupleName;
    if (updates.brideName !== undefined) updateData.brideName = updates.brideName;
    if (updates.groomName !== undefined) updateData.groomName = updates.groomName;
    if (updates.weddingDate) updateData.weddingDate = new Date(updates.weddingDate);
    if (updates.weddingTime !== undefined) updateData.weddingTime = updates.weddingTime;
    if (updates.venue !== undefined) updateData.venue = updates.venue;
    if (updates.venueAddress !== undefined) updateData.venueAddress = updates.venueAddress;
    if (updates.googleMapsUrl !== undefined) updateData.googleMapsUrl = updates.googleMapsUrl;
    if (updates.status) updateData.status = updates.status;
    if (updates.plan) updateData.plan = updates.plan;
    if (updates.heroImageUrl !== undefined) updateData.heroImageUrl = updates.heroImageUrl;
    if (updates.bannerUrl !== undefined) updateData.bannerUrl = updates.bannerUrl;

    // Handle section toggles
    if (Array.isArray(updates.sections)) {
      const optionalFeatureKeys = ['story', 'wishes', 'qa', 'moments'];
      for (const key of optionalFeatureKeys) {
        await db.weddingFeature.upsert({
          where: { weddingId_featureKey: { weddingId: id, featureKey: key } },
          update: { isEnabled: updates.sections.includes(key) },
          create: { weddingId: id, featureKey: key, isEnabled: updates.sections.includes(key) },
        });
      }
    }

    const wedding = await db.weddingAccount.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'WeddingAccount',
        entityId: id,
        details: JSON.stringify(updates),
      },
    });

    return NextResponse.json({ wedding });
  } catch (error) {
    console.error('Wedding update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/master/weddings — archive a wedding account
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Wedding ID required' }, { status: 400 });
    }

    await db.weddingAccount.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entity: 'WeddingAccount',
        entityId: id,
        details: JSON.stringify({ status: 'ARCHIVED' }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wedding delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}