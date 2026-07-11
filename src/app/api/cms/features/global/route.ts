import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireMasterAdmin, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// GET — All global feature toggles
// ============================================

export async function GET(request: Request) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const toggles = await db.globalFeatureToggle.findMany({
      orderBy: { featureKey: 'asc' },
    });

    return Response.json({
      success: true,
      data: toggles.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('Get global features error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// PATCH — Upsert a global feature toggle
// ============================================

const globalToggleSchema = z.object({
  featureKey: z.string().min(1, 'Feature key is required'),
  enabled: z.boolean(),
  description: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
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
    const parsed = globalToggleSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { featureKey, enabled, description } = parsed.data;

    const toggle = await db.globalFeatureToggle.upsert({
      where: { featureKey },
      create: {
        featureKey,
        enabled,
        description: description || null,
      },
      update: {
        enabled,
        ...(description !== undefined && { description }),
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'global_feature.toggle',
      resource: 'GlobalFeatureToggle',
      resourceId: toggle.id,
      details: { featureKey, enabled, description },
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
    console.error('Toggle global feature error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}