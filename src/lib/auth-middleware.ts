import { db } from '@/lib/db';
import { getServerSession } from './auth';
import { getIpAddress } from './auth';

export interface AuthContext {
  user: {
    userId: string;
    email: string;
    name: string;
    role: string;
    tenantId?: string;
    tenantRole?: string;
  } | null;
  error: string | null;
}

/**
 * Validates a request using the NextAuth session cookie.
 * Returns the authenticated user context compatible with existing route code.
 */
export async function authenticateRequest(request: Request): Promise<AuthContext> {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return { user: null, error: 'Authentication required. Please log in.' };
    }

    // For couple users, resolve their wedding account as tenantId
    let tenantId: string | undefined;
    let tenantRole: string | undefined;
    if (session.user.role === 'COUPLE') {
      const wedding = await db.weddingAccount.findFirst({
        where: { ownerId: session.user.id },
        select: { id: true },
      });
      tenantId = wedding?.id;
      tenantRole = 'admin'; // Couple users are admins of their own wedding
    }

    return {
      user: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        tenantId,
        tenantRole,
      },
      error: null,
    };
  } catch {
    return { user: null, error: 'Authentication failed. Please try again.' };
  }
}

/**
 * Requires SUPER_ADMIN or ACCOUNT_MANAGER role.
 */
export function requireMasterAdmin(user: { role: string }): string | null {
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ACCOUNT_MANAGER') {
    return 'Access denied. Admin privileges required.';
  }
  return null;
}

/**
 * Requires at least viewer role for a specific wedding (tenant).
 * Master admins have access to everything.
 */
export async function requireTenantAccess(
  user: { userId: string; role: string; tenantId?: string },
  weddingId: string,
  _requiredRole: string = 'viewer'
): Promise<string | null> {
  // Master admins have access to everything
  if (user.role === 'SUPER_ADMIN' || user.role === 'ACCOUNT_MANAGER') return null;

  // Couple users can only access their own wedding
  if (user.role === 'COUPLE') {
    if (user.tenantId === weddingId) return null;
    return 'Access denied. You do not have access to this wedding.';
  }

  // For other roles, check if user owns the wedding
  const wedding = await db.weddingAccount.findFirst({
    where: { id: weddingId, ownerId: user.userId },
  });

  if (!wedding) {
    return 'Access denied. You do not have access to this wedding.';
  }

  return null;
}

/**
 * Creates an audit log entry using correct Prisma schema field names.
 */
export async function createAuditLog(params: {
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  weddingId?: string;
  details?: Record<string, unknown>;
  request?: Request;
}): Promise<void> {
  const { userId, action, resource, resourceId, weddingId, details, request } = params;

  try {
    await db.auditLog.create({
      data: {
        userId,
        action,
        entity: resource || null,
        entityId: resourceId || null,
        weddingId: weddingId || null,
        details: details ? JSON.stringify(details) : null,
        ipAddress: request ? getIpAddress(request) : null,
      },
    });
  } catch {
    // Audit logging is non-critical — don't block the main operation
  }
}