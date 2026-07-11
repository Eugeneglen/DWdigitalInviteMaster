import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// GET — List feature toggles for a tenant
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

    const { id: tenantId } = await params;

    // Verify tenant exists
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return Response.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    const features = await db.tenantFeatureToggle.findMany({
      where: { tenantId },
      orderBy: { featureKey: 'asc' },
    });

    return Response.json({
      success: true,
      data: features.map((ft) => ({
        ...ft,
        createdAt: ft.createdAt.toISOString(),
        updatedAt: ft.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('Get tenant features error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// PATCH — Upsert a single feature toggle
// ============================================

const featureToggleSchema = z.object({
  featureKey: z.string().min(1, 'Feature key is required'),
  enabled: z.boolean(),
  config: z.record(z.unknown()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId } = await params;

    const accessError = await requireTenantAccess(user, tenantId, 'admin');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const body = await request.json();
    const parsed = featureToggleSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { featureKey, enabled, config } = parsed.data;

    const toggle = await db.tenantFeatureToggle.upsert({
      where: {
        tenantId_featureKey: { tenantId, featureKey },
      },
      create: {
        tenantId,
        featureKey,
        enabled,
        config: config ? JSON.stringify(config) : undefined,
      },
      update: {
        enabled,
        ...(config !== undefined && { config: JSON.stringify(config) }),
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'feature.toggle',
      resource: 'TenantFeatureToggle',
      resourceId: toggle.id,
      tenantId,
      details: { featureKey, enabled, config },
      request,
    });

    return Response.json({
      success: true,
      data: {
        ...toggle,
        createdAt: toggle.createdAt.toISOString(),
        updatedAt: toggle.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Toggle feature error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// PUT — Bulk update feature toggles
// ============================================

const bulkFeaturesSchema = z.object({
  features: z.array(featureToggleSchema).min(1, 'At least one feature is required'),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId } = await params;

    const accessError = await requireTenantAccess(user, tenantId, 'admin');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const body = await request.json();
    const parsed = bulkFeaturesSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { features } = parsed.data;

    const results = await db.$transaction(
      features.map((f) =>
        db.tenantFeatureToggle.upsert({
          where: {
            tenantId_featureKey: { tenantId, featureKey: f.featureKey },
          },
          create: {
            tenantId,
            featureKey: f.featureKey,
            enabled: f.enabled,
            config: f.config ? JSON.stringify(f.config) : undefined,
          },
          update: {
            enabled: f.enabled,
            ...(f.config !== undefined && { config: JSON.stringify(f.config) }),
          },
        })
      )
    );

    await createAuditLog({
      userId: user.userId,
      action: 'feature.bulk_toggle',
      resource: 'TenantFeatureToggle',
      tenantId,
      details: { count: features.length, features: features.map((f) => ({ featureKey: f.featureKey, enabled: f.enabled })) },
      request,
    });

    return Response.json({
      success: true,
      data: results.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('Bulk toggle features error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}