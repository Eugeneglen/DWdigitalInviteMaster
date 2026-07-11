import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// GET — List wishes for a tenant (paginated, filterable, with stats)
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return Response.json({ success: false, error: authError || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId } = await params;
    const accessError = await requireTenantAccess(user, tenantId, 'viewer');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const fromDate = searchParams.get('fromDate') || '';
    const toDate = searchParams.get('toDate') || '';

    // Build where clause
    const where: Record<string, unknown> = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { message: { contains: search } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) (where.createdAt as Record<string, unknown>).gte = new Date(fromDate);
      if (toDate) (where.createdAt as Record<string, unknown>).lte = new Date(toDate + 'T23:59:59.999Z');
    }

    const [wishes, total] = await Promise.all([
      db.wish.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.wish.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Always include stats
    const [totalCount, approvedCount, hiddenCount, flaggedCount] = await Promise.all([
      db.wish.count({ where: { tenantId } }),
      db.wish.count({ where: { tenantId, status: 'approved' } }),
      db.wish.count({ where: { tenantId, status: 'hidden' } }),
      db.wish.count({ where: { tenantId, status: 'flagged' } }),
    ]);

    return Response.json({
      success: true,
      data: {
        wishes: wishes.map((w) => ({
          id: w.id,
          tenantId: w.tenantId,
          name: w.name,
          relationship: w.relationship,
          message: w.message,
          imageUrl: w.imageUrl,
          status: w.status,
          createdAt: w.createdAt.toISOString(),
        })),
        total,
        page,
        limit,
        totalPages,
        stats: {
          total: totalCount,
          approved: approvedCount,
          hidden: hiddenCount,
          flagged: flaggedCount,
        },
      },
    });
  } catch (err) {
    console.error('Wishes list error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}