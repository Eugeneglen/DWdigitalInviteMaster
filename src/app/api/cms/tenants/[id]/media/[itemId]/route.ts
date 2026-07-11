import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// PATCH — Update a media item
// ============================================

const updateMediaSchema = z.object({
  url: z.string().url().optional(),
  category: z.string().min(1).optional(),
  caption: z.string().nullable().optional(),
  alt: z.string().nullable().optional(),
  order: z.number().int().optional(),
  isCover: z.boolean().optional(),
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

    const existing = await db.mediaItem.findFirst({
      where: { id: itemId, tenantId },
    });
    if (!existing) {
      return Response.json({ success: false, error: 'Media item not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateMediaSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updated = await db.mediaItem.update({
      where: { id: itemId },
      data: parsed.data,
    });

    await createAuditLog({
      userId: user.userId,
      action: 'media.update',
      resource: 'MediaItem',
      resourceId: itemId,
      tenantId,
      details: {
        before: { category: existing.category, url: existing.url, order: existing.order, isCover: existing.isCover },
        after: { category: updated.category, url: updated.url, order: updated.order, isCover: updated.isCover },
      },
      request,
    });

    return Response.json({
      success: true,
      data: {
        id: updated.id,
        tenantId: updated.tenantId,
        category: updated.category,
        url: updated.url,
        caption: updated.caption,
        alt: updated.alt,
        order: updated.order,
        isCover: updated.isCover,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Update media item error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// DELETE — Delete a media item
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

    const existing = await db.mediaItem.findFirst({
      where: { id: itemId, tenantId },
    });
    if (!existing) {
      return Response.json({ success: false, error: 'Media item not found' }, { status: 404 });
    }

    await db.mediaItem.delete({ where: { id: itemId } });

    await createAuditLog({
      userId: user.userId,
      action: 'media.delete',
      resource: 'MediaItem',
      resourceId: itemId,
      tenantId,
      details: { category: existing.category, url: existing.url },
      request,
    });

    return Response.json({ success: true, data: { id: itemId } });
  } catch (err) {
    console.error('Delete media item error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}