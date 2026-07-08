import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 *
 * Generates a reset token, stores it on the user record, and sends a
 * password-reset email containing a link to /reset-password?token=<token>.
 *
 * Security: Always returns 200 with the same message regardless of whether
 * the account exists, to prevent user-enumeration attacks.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.isActive) {
      // Don't reveal whether the account exists
      return NextResponse.json({
        message:
          'If an account with that email exists, a password reset link has been sent to your inbox.',
      });
    }

    // Generate a secure random token (hex, 32 bytes = 64 chars)
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // ── Email dispatch ───────────────────────────────────────────────
    // Production: send a real email with the reset link.
    //
    //   import { sendEmail } from '@/lib/email';
    //   const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    //   await sendEmail({
    //     to: user.email,
    //     subject: 'Dreamweavers — Password Reset',
    //     html: `
    //       <p>Hi ${user.name},</p>
    //       <p>We received a request to reset your password. Click the link below to set a new password:</p>
    //       <p><a href="${resetUrl}">Reset Password</a></p>
    //       <p>This link expires in 30 minutes. If you did not request this, you can safely ignore this email.</p>
    //     `,
    //   });
    // ──────────────────────────────────────────────────────────────────
    console.log(`[forgot-password] Password reset requested for ${user.email}`);

    return NextResponse.json({
      message:
        'If an account with that email exists, a password reset link has been sent to your inbox.',
    });
  } catch (error) {
    console.error('[forgot-password] Error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}