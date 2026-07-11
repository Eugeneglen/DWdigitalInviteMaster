/**
 * Tenant Resolution Utilities
 *
 * Resolves the active weddingId (tenant) from the incoming request.
 * Priority chain:
 *   1. URL path — /api/content/[weddingSlug]/... slug lookup
 *   2. NextAuth session — weddingId from authenticated CMS user
 *   3. DEV_ACCOUNT_ID fallback — single-tenant dev environment only
 */

import { db } from '@/lib/db';

// ─── Dev Fallback ────────────────────────────────────────────────────────────
export const DEV_ACCOUNT_ID = process.env.NEXT_PUBLIC_DEV_ACCOUNT_ID ?? 'dev_account';

/**
 * Resolve the actual accountId for workspace API routes.
 * Requires an authenticated user ID. Falls back to DEV_ACCOUNT_ID only in development.
 */
export async function resolveWorkspaceAccountId(sessionUserId?: string): Promise<string | null> {
  // 1. If user is authenticated, look up their owned wedding
  if (sessionUserId) {
    const account = await db.weddingAccount.findFirst({
      where: { ownerId: sessionUserId },
      select: { id: true },
    });
    if (account) return account.id;
  }

  // 2. Dev-only fallback: use DEV_ACCOUNT_ID or first account
  if (process.env.NODE_ENV === 'development') {
    try {
      const account = await db.weddingAccount.findUnique({ where: { id: DEV_ACCOUNT_ID }, select: { id: true } });
      if (account) return account.id;
    } catch { /* may not exist */ }

    const firstAccount = await db.weddingAccount.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    return firstAccount?.id ?? null;
  }

  return null;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ResolvedAccount {
  id: string;
  brideName: string;
  groomName: string;
  status: string;
}

// ─── Core Resolution ─────────────────────────────────────────────────────────

/**
 * Resolve the weddingId from an incoming request.
 * SECURITY: Only uses URL path-based resolution (slug lookup).
 * Header-based resolution has been removed to prevent cross-tenant access.
 */
export async function resolveWeddingId(request: Request): Promise<string | null> {
  // Check URL path for content API pattern: /api/content/[weddingSlug]/...
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
 * can be resolved. Use in API routes that require a wedding context.
 */
export async function requireWeddingId(request: Request): Promise<string> {
  const weddingId = await resolveWeddingId(request);

  if (weddingId) return weddingId;

  if (process.env.NODE_ENV === 'development') {
    return DEV_ACCOUNT_ID;
  }

  throw new Error(
    'Tenant resolution failed: no weddingId found in URL path.'
  );
}

// ─── Account Lookup ──────────────────────────────────────────────────────────

/**
 * Look up a WeddingAccount by its public slug.
 */
export async function resolveAccountBySlug(
  slug: string
): Promise<ResolvedAccount | null> {
  try {
    const account = await db.weddingAccount.findUnique({
      where: { slug },
      select: {
        id: true,
        brideName: true,
        groomName: true,
        status: true,
      },
    });

    if (!account) return null;

    return {
      id: account.id,
      brideName: account.brideName ?? '',
      groomName: account.groomName ?? '',
      status: account.status,
    };
  } catch {
    return null;
  }
}