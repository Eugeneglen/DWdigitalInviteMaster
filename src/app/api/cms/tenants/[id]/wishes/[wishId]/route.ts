import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

const moderateSchema = z.object({
  status: z.enum(['approved', 'hidden', 'flagged']),
});

// ============================================
// PATCH — Moderate a wish (change status)
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; wishId: string }> }
) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return Response.json({ success: false, error: authError || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId, wishId } = await params;
    const accessError = await requireTenantAccess(user, tenantId, 'editor');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const existing = await db.wish.findFirst({
      where: { id: wishId, tenantId },
    });

    if (!existing) {
      return Response.json({ success: false, error: 'Wish not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = moderateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: 'Invalid status. Use: approved, hidden, or flagged.' }, { status: 400 });
    }

    const updated = await db.wish.update({
      where: { id: wishId },
      data: { status: parsed.data.status },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'wish.moderate',
      resource: 'Wish',
      resourceId: wishId,
      tenantId,
      details: {
        before: { status: existing.status },
        after: { status: parsed.data.status },
        name: existing.name,
      },
      request,
    });

    return Response.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Moderate wish error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// DELETE — Remove a wish
// ============================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; wishId: string }> }
) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return Response.json({ success: false, error: authError || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId, wishId } = await params;
    const accessError = await requireTenantAccess(user, tenantId, 'editor');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const existing = await db.wish.findFirst({
      where: { id: wishId, tenantId },
    });

    if (!existing) {
      return Response.json({ success: false, error: 'Wish not found' }, { status: 404 });
    }

    await db.wish.delete({ where: { id: wishId } });

    await createAuditLog({
      userId: user.userId,
      action: 'wish.delete',
      resource: 'Wish',
      resourceId: wishId,
      tenantId,
      details: { name: existing.name },
      request,
    });

    return Response.json({ success: true, data: { id: wishId } });
  } catch (err) {
    console.error('Delete wish error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}