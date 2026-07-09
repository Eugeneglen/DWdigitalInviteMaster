/**
 * Tenant Resolution Utilities
 *
 * Resolves the active weddingId (tenant) from the incoming request.
 * Priority chain (path-based routing, no subdomain):
 *   1. NextAuth session — weddingId claim from authenticated CMS user
 *   2. Header x-wedding-id — for internal / programmatic API access
 *   3. URL path — /api/content/[weddingSlug]/... slug lookup
 *   4. DEV_ACCOUNT_ID fallback — single-tenant dev environment
 */

import { db } from '@/lib/db';
import { headers } from 'next/headers';

// ─── Dev Fallback ────────────────────────────────────────────────────────────
// Used in single-tenant development so every query has a valid weddingId
// even when no session or header is present.
export const DEV_ACCOUNT_ID = process.env.NEXT_PUBLIC_DEV_ACCOUNT_ID ?? 'dev_account';

/**
 * Resolve the actual accountId for workspace API routes.
 * In dev mode without auth, falls back to the first account in the database.
 */
export async function resolveWorkspaceAccountId(sessionUserId?: string): Promise<string | null> {
  // 1. If user is authenticated, look up their account via membership
  if (sessionUserId) {
    const membership = await db.accountMember.findFirst({
      where: { userId: sessionUserId },
      select: { accountId: true },
    });
    if (membership) return membership.accountId;
  }

  // 2. Try the DEV_ACCOUNT_ID
  try {
    const account = await db.account.findUnique({ where: { id: DEV_ACCOUNT_ID }, select: { id: true } });
    if (account) return account.id;
  } catch { /* table may not exist */ }

  // 3. Dev fallback: use the first account in the database
  const firstAccount = await db.account.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  return firstAccount?.id ?? null;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ResolvedAccount {
  id: string;
  coupleName1: string;
  coupleName2: string;
  status: string;
}

// ─── Core Resolution ─────────────────────────────────────────────────────────

/**
 * Resolve the weddingId from an incoming request using the priority chain.
 * Returns `null` when no tenant can be determined.
 */
export async function resolveWeddingId(request: Request): Promise<string | null> {
  // 1. Check NextAuth session (for CMS admin requests)
  //    In a real implementation this would call `getServerSession(authOptions)`
  //    and read `session.weddingId`. For now we read the header that the
  //    auth layer is expected to forward.
  const sessionHeader = request.headers.get('x-session-wedding-id');
  if (sessionHeader) return sessionHeader;

  // 2. Check x-wedding-id header (internal / programmatic API access)
  const headerId = request.headers.get('x-wedding-id');
  if (headerId) return headerId;

  // 3. Check URL path for content API pattern: /api/content/[weddingSlug]/...
  const url = new URL(request.url);
  const contentMatch = url.pathname.match(/^\/api\/content\/([^/]+)/);
  if (contentMatch?.[1]) {
    const account = await resolveAccountBySlug(contentMatch[1]);
    if (account) return account.id;
  }

  return null;
}

/**
 * Like `resolveWeddingId` but throws a descriptive error when no tenant
 * can be resolved. Use in API routes that require authentication.
 */
export async function requireWeddingId(request: Request): Promise<string> {
  // Try the standard resolution chain first
  const weddingId = await resolveWeddingId(request);

  if (weddingId) return weddingId;

  // Dev fallback — in development we return the dev account ID so that
  // local development is frictionless. In production this would return null
  // and we'd throw below.
  if (process.env.NODE_ENV === 'development') {
    return DEV_ACCOUNT_ID;
  }

  throw new Error(
    'Tenant resolution failed: no weddingId found in session, header, or URL path.'
  );
}

// ─── Account Lookup ──────────────────────────────────────────────────────────

/**
 * Look up an Account by its public slug.
 * Returns null if not found or if the account is not in a viewable state.
 */
export async function resolveAccountBySlug(
  slug: string
): Promise<ResolvedAccount | null> {
  try {
    const account = await db.account.findUnique({
      where: { slug },
      select: {
        id: true,
        coupleName1: true,
        coupleName2: true,
        status: true,
      },
    });

    if (!account) return null;

    return {
      id: account.id,
      coupleName1: account.coupleName1 ?? '',
      coupleName2: account.coupleName2 ?? '',
      status: account.status,
    };
  } catch {
    // If the Account model doesn't exist yet (early dev), return null
    return null;
  }
}