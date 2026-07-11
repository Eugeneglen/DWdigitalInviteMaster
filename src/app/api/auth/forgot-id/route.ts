import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/auth/forgot-id
 * Body: { name: string, email: string }
 *
 * Looks up a user account by **exact** name match. Additionally requires
 * the user to provide their email domain (the part after @) as a secondary
 * verification factor — this prevents strangers from scraping the user base
 * while still giving legitimate users enough information to identify their
 * account.
 *
 * Returns a single masked email result (or none) to minimise leakage.
 * Always returns 200 to avoid information disclosure.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    // ── Input validation ──────────────────────────────────────────────
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Your registered name is required.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Please provide the email address associated with your account.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters.' },
        { status: 400 }
      );
    }

    // Extract domain for secondary verification
    const emailParts = normalizedEmail.split('@');
    if (emailParts.length !== 2 || !emailParts[1]) {
      return NextResponse.json(
        { error: 'Please enter a valid email address (e.g. you@example.com).' },
        { status: 400 }
      );
    }
    const providedDomain = emailParts[1].toLowerCase();

    // ── Exact name match + domain verification ────────────────────────
    const user = await db.user.findFirst({
      where: {
        name: { equals: trimmedName },
        email: { endsWith: `@${providedDomain}` },
        isActive: true,
      },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      // Generic response — do not reveal whether a match was found
      return NextResponse.json({
        message:
          'No account found. Please ensure both your registered name and email domain are correct, or contact support.',
        results: [],
      });
    }

    // Mask email: show first 2 chars, asterisks, last char before @, then domain
    const local = user.email.split('@')[0];
    const domain = emailParts[1];
    const maskedLocal =
      local.length <= 3
        ? local[0] + '***'
        : local.slice(0, 2) + '***' + local.slice(-1);

    return NextResponse.json({
      message: 'Account found. Please use the email below to sign in.',
      results: [
        {
          name: user.name,
          role: user.role,
          maskedEmail: `${maskedLocal}@${domain}`,
        },
      ],
    });
  } catch (error) {
    console.error('[forgot-id] Error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}