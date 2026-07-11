import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// PATCH — Update a FAQ item
// ============================================

const updateFaqSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
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

    const existing = await db.fAQItem.findFirst({
      where: { id: itemId, tenantId },
    });
    if (!existing) {
      return Response.json({ success: false, error: 'FAQ item not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateFaqSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updated = await db.fAQItem.update({
      where: { id: itemId },
      data: parsed.data,
    });

    await createAuditLog({
      userId: user.userId,
      action: 'faq.update',
      resource: 'FAQItem',
      resourceId: itemId,
      tenantId,
      details: {
        before: { question: existing.question, order: existing.order, enabled: existing.enabled },
        after: { question: updated.question, order: updated.order, enabled: updated.enabled },
      },
      request,
    });

    return Response.json({
      success: true,
      data: {
        id: updated.id,
        tenantId: updated.tenantId,
        question: updated.question,
        answer: updated.answer,
        order: updated.order,
        enabled: updated.enabled,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Update FAQ item error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// DELETE — Delete a FAQ item
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

    const existing = await db.fAQItem.findFirst({
      where: { id: itemId, tenantId },
    });
    if (!existing) {
      return Response.json({ success: false, error: 'FAQ item not found' }, { status: 404 });
    }

    await db.fAQItem.delete({ where: { id: itemId } });

    await createAuditLog({
      userId: user.userId,
      action: 'faq.delete',
      resource: 'FAQItem',
      resourceId: itemId,
      tenantId,
      details: { question: existing.question },
      request,
    });

    return Response.json({ success: true, data: { id: itemId } });
  } catch (err) {
    console.error('Delete FAQ item error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}