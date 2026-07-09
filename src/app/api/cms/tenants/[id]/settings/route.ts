import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// GET — Get tenant settings (parsed JSON)
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

    const accessError = await requireTenantAccess(user, tenantId, 'viewer');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, settings: true },
    });

    if (!tenant) {
      return Response.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    let settings: Record<string, unknown> = {};
    try {
      settings = JSON.parse(tenant.settings);
    } catch {
      settings = {};
    }

    return Response.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error('Get tenant settings error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// PUT — Replace entire settings object (merge with existing)
// ============================================

const updateSettingsSchema = z.object({
  settings: z.record(z.unknown()),
});

export async function PUT(
  request: Request,
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

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, settings: true },
    });

    if (!tenant) {
      return Response.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    // Merge with existing settings
    let existingSettings: Record<string, unknown> = {};
    try {
      existingSettings = JSON.parse(tenant.settings);
    } catch {
      existingSettings = {};
    }

    const mergedSettings = { ...existingSettings, ...parsed.data.settings };
    const settingsString = JSON.stringify(mergedSettings);

    const updated = await db.tenant.update({
      where: { id: tenantId },
      data: { settings: settingsString },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'tenant.settings.update',
      resource: 'Tenant',
      resourceId: tenantId,
      tenantId,
      details: {
        before: existingSettings,
        after: mergedSettings,
      },
      request,
    });

    return Response.json({
      success: true,
      data: mergedSettings,
    });
  } catch (err) {
    console.error('Update tenant settings error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}