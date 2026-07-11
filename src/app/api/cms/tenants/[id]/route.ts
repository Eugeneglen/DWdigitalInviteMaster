import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireMasterAdmin, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// GET — Single tenant with users + features
// ============================================

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const authError = requireMasterAdmin(user);
    if (authError) {
      return Response.json({ success: false, error: authError }, { status: 403 });
    }

    const { id } = await params;
    const tenant = await db.tenant.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true, updatedAt: true },
            },
          },
        },
        featureToggles: true,
      },
    });

    if (!tenant) {
      return Response.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        ...tenant,
        eventDate: tenant.eventDate?.toISOString() ?? null,
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString(),
        users: tenant.users.map((tu) => ({
          ...tu,
          createdAt: tu.createdAt.toISOString(),
          user: {
            ...tu.user,
            createdAt: tu.user.createdAt.toISOString(),
            updatedAt: tu.user.updatedAt.toISOString(),
          },
        })),
        featureToggles: tenant.featureToggles.map((ft) => ({
          ...ft,
          createdAt: ft.createdAt.toISOString(),
          updatedAt: ft.updatedAt.toISOString(),
        })),
      },
    });
  } catch (err) {
    console.error('Get tenant error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// PATCH — Update tenant
// ============================================

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens only')
    .optional(),
  eventType: z.string().min(1).optional(),
  status: z.string().optional(),
  coupleName1: z.string().nullable().optional(),
  coupleName2: z.string().nullable().optional(),
  eventDate: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  settings: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const authError = requireMasterAdmin(user);
    if (authError) {
      return Response.json({ success: false, error: authError }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.tenant.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateTenantSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = { ...parsed.data };
    if (data.eventDate !== undefined) {
      (data as Record<string, unknown>).eventDate = data.eventDate ? new Date(data.eventDate) : null;
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await db.tenant.findUnique({ where: { slug: data.slug } });
      if (slugExists) {
        return Response.json({ success: false, error: 'A tenant with this slug already exists' }, { status: 400 });
      }
    }

    const updated = await db.tenant.update({
      where: { id },
      data: data as Record<string, unknown>,
    });

    await createAuditLog({
      userId: user.userId,
      action: 'tenant.update',
      resource: 'Tenant',
      resourceId: id,
      details: {
        before: {
          name: existing.name,
          slug: existing.slug,
          eventType: existing.eventType,
          status: existing.status,
        },
        after: {
          name: updated.name,
          slug: updated.slug,
          eventType: updated.eventType,
          status: updated.status,
        },
      },
      request,
    });

    return Response.json({
      success: true,
      data: {
        ...updated,
        eventDate: updated.eventDate?.toISOString() ?? null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Update tenant error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// DELETE — Remove tenant
// ============================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const authError = requireMasterAdmin(user);
    if (authError) {
      return Response.json({ success: false, error: authError }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.tenant.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    await db.tenant.delete({ where: { id } });

    await createAuditLog({
      userId: user.userId,
      action: 'tenant.delete',
      resource: 'Tenant',
      resourceId: id,
      details: { name: existing.name, slug: existing.slug },
      request,
    });

    return Response.json({ success: true, data: { id } });
  } catch (err) {
    console.error('Delete tenant error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}