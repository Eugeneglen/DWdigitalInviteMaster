import { z } from 'zod';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// GET — List all FAQ items for a tenant (including disabled)
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

    const items = await db.fAQItem.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
    });

    return Response.json({
      success: true,
      data: items.map((item) => ({
        id: item.id,
        tenantId: item.tenantId,
        question: item.question,
        answer: item.answer,
        order: item.order,
        enabled: item.enabled,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('List FAQ items error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// POST — Create a new FAQ item
// ============================================

const createFaqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
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
    const parsed = createFaqSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { question, answer } = parsed.data;

    // Auto-assign order = max existing order + 1
    const maxOrder = await db.fAQItem.findFirst({
      where: { tenantId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = (maxOrder?.order ?? -1) + 1;

    const item = await db.fAQItem.create({
      data: {
        tenantId,
        question,
        answer,
        order,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'faq.create',
      resource: 'FAQItem',
      resourceId: item.id,
      tenantId,
      details: { question, order },
      request,
    });

    return Response.json({
      success: true,
      data: {
        id: item.id,
        tenantId: item.tenantId,
        question: item.question,
        answer: item.answer,
        order: item.order,
        enabled: item.enabled,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Create FAQ item error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}