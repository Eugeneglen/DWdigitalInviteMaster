import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// PATCH — Update a content block
// ============================================

const updateBlockSchema = z.object({
  sectionKey: z.string().min(1).optional(),
  title: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  order: z.number().int().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId, blockId } = await params;

    const accessError = await requireTenantAccess(user, tenantId, 'editor');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const existing = await db.contentBlock.findFirst({
      where: { id: blockId, tenantId },
    });
    if (!existing) {
      return Response.json({ success: false, error: 'Content block not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateBlockSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updated = await db.contentBlock.update({
      where: { id: blockId },
      data: parsed.data,
    });

    await createAuditLog({
      userId: user.userId,
      action: 'content_block.update',
      resource: 'ContentBlock',
      resourceId: blockId,
      tenantId,
      details: {
        before: { sectionKey: existing.sectionKey, title: existing.title, status: existing.status, order: existing.order },
        after: { sectionKey: updated.sectionKey, title: updated.title, status: updated.status, order: updated.order },
      },
      request,
    });

    return Response.json({
      success: true,
      data: {
        id: updated.id,
        tenantId: updated.tenantId,
        sectionKey: updated.sectionKey,
        title: updated.title,
        content: updated.content,
        imageUrl: updated.imageUrl,
        order: updated.order,
        status: updated.status,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Update content block error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// DELETE — Delete a content block
// ============================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId, blockId } = await params;

    const accessError = await requireTenantAccess(user, tenantId, 'editor');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const existing = await db.contentBlock.findFirst({
      where: { id: blockId, tenantId },
    });
    if (!existing) {
      return Response.json({ success: false, error: 'Content block not found' }, { status: 404 });
    }

    await db.contentBlock.delete({ where: { id: blockId } });

    await createAuditLog({
      userId: user.userId,
      action: 'content_block.delete',
      resource: 'ContentBlock',
      resourceId: blockId,
      tenantId,
      details: { sectionKey: existing.sectionKey, title: existing.title },
      request,
    });

    return Response.json({ success: true, data: { id: blockId } });
  } catch (err) {
    console.error('Delete content block error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}