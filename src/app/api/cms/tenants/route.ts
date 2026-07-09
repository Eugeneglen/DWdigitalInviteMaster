import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireMasterAdmin, createAuditLog } from '@/lib/auth-middleware';
import { FEATURE_KEYS } from '@/lib/auth';

// ============================================
// GET — List tenants (paginated, searchable)
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const authError = requireMasterAdmin(user);
    if (authError) {
      return Response.json({ success: false, error: authError }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [tenants, total] = await Promise.all([
      db.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              featureToggles: true,
            },
          },
        },
      }),
      db.tenant.count({ where }),
    ]);

    return Response.json({
      success: true,
      data: {
        tenants: tenants.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          eventDate: t.eventDate?.toISOString() ?? null,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('List tenants error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// POST — Create tenant
// ============================================

const createTenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  eventType: z.string().min(1, 'Event type is required'),
  coupleName1: z.string().optional(),
  coupleName2: z.string().optional(),
  eventDate: z.string().optional(),
  venue: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const authError = requireMasterAdmin(user);
    if (authError) {
      return Response.json({ success: false, error: authError }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createTenantSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { slug } = parsed.data;
    const existing = await db.tenant.findUnique({ where: { slug } });
    if (existing) {
      return Response.json({ success: false, error: 'A tenant with this slug already exists' }, { status: 400 });
    }

    const eventFeatures = [
      FEATURE_KEYS.RSVP,
      FEATURE_KEYS.WISHES,
      FEATURE_KEYS.STORY,
      FEATURE_KEYS.MOMENTS,
      FEATURE_KEYS.SCHEDULE,
      FEATURE_KEYS.QA,
      FEATURE_KEYS.GETTING_THERE,
    ];

    const tenant = await db.tenant.create({
      data: {
        ...parsed.data,
        eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
        featureToggles: {
          create: eventFeatures.map((key) => ({
            featureKey: key,
            enabled: true,
          })),
        },
      },
      include: {
        featureToggles: true,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'tenant.create',
      resource: 'Tenant',
      resourceId: tenant.id,
      details: { ...parsed.data, eventDate: parsed.data.eventDate },
      request,
    });

    return Response.json(
      {
        success: true,
        data: {
          ...tenant,
          createdAt: tenant.createdAt.toISOString(),
          updatedAt: tenant.updatedAt.toISOString(),
          eventDate: tenant.eventDate?.toISOString() ?? null,
          featureToggles: tenant.featureToggles.map((ft) => ({
            ...ft,
            createdAt: ft.createdAt.toISOString(),
            updatedAt: ft.updatedAt.toISOString(),
          })),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create tenant error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}