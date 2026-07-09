import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// ============================================
// GET — Dashboard stats (role-dependent)
// ============================================

export async function GET(request: Request) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    if (user.role === 'master_admin') {
      const [totalTenants, activeTenants, totalUsers, recentLogCount] = await Promise.all([
        db.tenant.count(),
        db.tenant.count({ where: { status: 'active' } }),
        db.user.count(),
        db.auditLog.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      return Response.json({
        success: true,
        data: {
          totalTenants,
          activeTenants,
          totalUsers,
          recentLogCount,
        },
      });
    }

    // Tenant admin stats
    if (user.tenantId) {
      const [totalGuests, totalWishes, totalContacts, featureToggles] = await Promise.all([
        db.rSVPSubmission.count({ where: { tenantId: user.tenantId } }),
        db.wish.count({ where: { tenantId: user.tenantId } }),
        db.contactSubmission.count({ where: { tenantId: user.tenantId } }),
        db.tenantFeatureToggle.findMany({
          where: { tenantId: user.tenantId },
          select: { featureKey: true, enabled: true },
        }),
      ]);

      return Response.json({
        success: true,
        data: {
          totalGuests,
          totalWishes,
          totalContacts,
          featureToggles: featureToggles.map((ft) => ({
            featureKey: ft.featureKey,
            enabled: ft.enabled,
          })),
        },
      });
    }

    // Fallback for users without tenant
    return Response.json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error('Stats error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}