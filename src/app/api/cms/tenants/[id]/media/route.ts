import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// GET — List media items for a tenant (with optional category filter)
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

    // Verify tenant exists
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return Response.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    // Parse optional category query param
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { tenantId };
    if (category) {
      where.category = category;
    }

    const items = await db.mediaItem.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return Response.json({
      success: true,
      data: items.map((item) => ({
        id: item.id,
        tenantId: item.tenantId,
        category: item.category,
        url: item.url,
        caption: item.caption,
        alt: item.alt,
        order: item.order,
        isCover: item.isCover,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('List media items error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// POST — Create a new media item
// ============================================

const createMediaSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  category: z.string().min(1, 'Category is required'),
  caption: z.string().optional(),
  alt: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId } = await params;

    const accessError = await requireTenantAccess(user, tenantId, 'editor');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    // Verify tenant exists
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return Response.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createMediaSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { url, category, caption, alt } = parsed.data;

    // Auto-assign order = max existing order + 1
    const maxOrder = await db.mediaItem.findFirst({
      where: { tenantId, category },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = (maxOrder?.order ?? -1) + 1;

    const item = await db.mediaItem.create({
      data: {
        tenantId,
        category,
        url,
        caption: caption ?? null,
        alt: alt ?? null,
        order,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'media.create',
      resource: 'MediaItem',
      resourceId: item.id,
      tenantId,
      details: { category, url, order },
      request,
    });

    return Response.json({
      success: true,
      data: {
        id: item.id,
        tenantId: item.tenantId,
        category: item.category,
        url: item.url,
        caption: item.caption,
        alt: item.alt,
        order: item.order,
        isCover: item.isCover,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Create media item error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}