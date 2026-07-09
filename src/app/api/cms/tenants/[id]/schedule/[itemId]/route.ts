import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// PATCH — Update a schedule item
// ============================================

const updateScheduleSchema = z.object({
  time: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().int().optional(),
  enabled: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId, itemId } = await params;

    const accessError = await requireTenantAccess(user, tenantId, 'editor');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const existing = await db.scheduleItem.findFirst({
      where: { id: itemId, tenantId },
    });
    if (!existing) {
      return Response.json({ success: false, error: 'Schedule item not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.tags !== undefined) {
      data.tags = JSON.stringify(parsed.data.tags);
    }

    const updated = await db.scheduleItem.update({
      where: { id: itemId },
      data,
    });

    await createAuditLog({
      userId: user.userId,
      action: 'schedule.update',
      resource: 'ScheduleItem',
      resourceId: itemId,
      tenantId,
      details: {
        before: { title: existing.title, time: existing.time, order: existing.order, enabled: existing.enabled },
        after: { title: updated.title, time: updated.time, order: updated.order, enabled: updated.enabled },
      },
      request,
    });

    return Response.json({
      success: true,
      data: {
        id: updated.id,
        tenantId: updated.tenantId,
        time: updated.time,
        title: updated.title,
        description: updated.description,
        location: updated.location,
        tags: JSON.parse(updated.tags || '[]'),
        order: updated.order,
        enabled: updated.enabled,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Update schedule item error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// DELETE — Delete a schedule item
// ============================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId, itemId } = await params;

    const accessError = await requireTenantAccess(user, tenantId, 'editor');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const existing = await db.scheduleItem.findFirst({
      where: { id: itemId, tenantId },
    });
    if (!existing) {
      return Response.json({ success: false, error: 'Schedule item not found' }, { status: 404 });
    }

    await db.scheduleItem.delete({ where: { id: itemId } });

    await createAuditLog({
      userId: user.userId,
      action: 'schedule.delete',
      resource: 'ScheduleItem',
      resourceId: itemId,
      tenantId,
      details: { title: existing.title, time: existing.time },
      request,
    });

    return Response.json({ success: true, data: { id: itemId } });
  } catch (err) {
    console.error('Delete schedule item error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}