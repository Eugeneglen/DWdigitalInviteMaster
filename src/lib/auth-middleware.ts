import { db } from '@/lib/db';
import { verifyToken, extractBearerToken, getIpAddress, getUserAgent, type JWTPayload } from './auth';

export interface AuthContext {
  user: JWTPayload | null;
  error: string | null;
}

/**
 * Validates a request and returns the authenticated user context.
 * Used by all protected CMS API routes.
 */
export async function authenticateRequest(request: Request): Promise<AuthContext> {
  const token = extractBearerToken(request);

  if (!token) {
    return { user: null, error: 'Authentication required. Please log in.' };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { user: null, error: 'Invalid or expired session. Please log in again.' };
  }

  return { user: payload, error: null };
}

/**
 * Requires master_admin role. Returns error context if not authorized.
 */
export function requireMasterAdmin(user: JWTPayload): string | null {
  if (user.role !== 'master_admin') {
    return 'Access denied. Master admin privileges required.';
  }
  return null;
}

/**
 * Requires at least viewer role for a specific tenant.
 * Returns error context if not authorized.
 */
export async function requireTenantAccess(
  user: JWTPayload,
  tenantId: string,
  requiredRole: string = 'viewer'
): Promise<string | null> {
  // Master admins have access to everything
  if (user.role === 'master_admin') return null;

  const roleHierarchy = ['viewer', 'editor', 'admin'];
  const userRoleLevel = roleHierarchy.indexOf(user.tenantRole || 'viewer');
  const requiredRoleLevel = roleHierarchy.indexOf(requiredRole);

  if (userRoleLevel < requiredRoleLevel) {
    return `Access denied. ${requiredRole} privileges required for this action.`;
  }

  // Verify the user has access to this tenant's wedding
  const wedding = await db.weddingAccount.findFirst({
    where: { id: tenantId, ownerId: user.userId },
  });

  if (!wedding) {
    return 'Access denied. You do not have access to this tenant.';
  }

  return null;
}

/**
 * Creates an audit log entry.
 */
export async function createAuditLog(params: {
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  tenantId?: string;
  details?: Record<string, unknown>;
  request?: Request;
}): Promise<void> {
  const { userId, action, resource, resourceId, tenantId, details, request } = params;

  await db.auditLog.create({
    data: {
      userId,
      action,
      resource: resource || null,
      resourceId: resourceId || null,
      tenantId: tenantId || null,
      details: details ? JSON.stringify(details) : null,
      ipAddress: request ? getIpAddress(request) : null,
      userAgent: request ? getUserAgent(request) : null,
    },
  });
}