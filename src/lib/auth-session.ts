import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions, resolveSecret } from '@/lib/auth';

// ── Robust session helper for API route handlers ─────────────────────────────
// Turbopack route handlers sometimes lose access to process.env, causing
// getServerSession to fail even when a valid session cookie exists.
// This helper falls back to getToken() which reads the cookie directly.

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  expires: string;
}

export async function getAuthSession(request?: NextRequest): Promise<AuthSession | null> {
  // Primary: standard NextAuth approach
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return session as AuthSession;
  }

  // Fallback: decrypt JWT token directly from cookie
  if (request) {
    const token = await getToken({
      req: request,
      secret: resolveSecret(),
    });
    if (token) {
      return {
        user: {
          id: token.id as string,
          email: (token.email as string) || '',
          name: (token.name as string) || '',
          role: (token.role as string) || '',
        },
        expires: (token.exp as unknown as string) || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }
  }

  return null;
}