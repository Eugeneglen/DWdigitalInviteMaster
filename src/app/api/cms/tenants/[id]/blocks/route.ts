import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// GET — List content blocks for a tenant (with optional sectionKey filter, includes drafts)
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

    // Parse optional sectionKey query param
    const { searchParams } = new URL(request.url);
    const sectionKey = searchParams.get('sectionKey');

    const where: Record<string, unknown> = { tenantId };
    if (sectionKey) {
      where.sectionKey = sectionKey;
    }

    const items = await db.contentBlock.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return Response.json({
      success: true,
      data: items.map((item) => ({
        id: item.id,
        tenantId: item.tenantId,
        sectionKey: item.sectionKey,
        title: item.title,
        content: item.content,
        imageUrl: item.imageUrl,
        order: item.order,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('List content blocks error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// POST — Create a new content block
// ============================================

const createBlockSchema = z.object({
  sectionKey: z.string().min(1, 'Section key is required'),
  title: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
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
    const parsed = createBlockSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { sectionKey, title, content, imageUrl, status } = parsed.data;

    // Auto-assign order = max existing order + 1 within same sectionKey
    const maxOrder = await db.contentBlock.findFirst({
      where: { tenantId, sectionKey },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = (maxOrder?.order ?? -1) + 1;

    const item = await db.contentBlock.create({
      data: {
        tenantId,
        sectionKey,
        title: title ?? null,
        content: content ?? null,
        imageUrl: imageUrl ?? null,
        status: status ?? 'published',
        order,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'content_block.create',
      resource: 'ContentBlock',
      resourceId: item.id,
      tenantId,
      details: { sectionKey, title, status: item.status, order },
      request,
    });

    return Response.json({
      success: true,
      data: {
        id: item.id,
        tenantId: item.tenantId,
        sectionKey: item.sectionKey,
        title: item.title,
        content: item.content,
        imageUrl: item.imageUrl,
        order: item.order,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Create content block error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}