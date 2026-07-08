'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError(
        'Invalid or missing reset token. Please request a new password reset link.'
      );
    }
    setIsValidating(false);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }

      setIsSuccess(true);
      toast({
        title: 'Password Reset Successful',
        description: 'You can now sign in with your new password.',
      });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'input-line !text-[15px] !font-sans placeholder:text-charcoal-ink/30';

  // ── Validating state ───────────────────────────────────────────
  if (isValidating) {
    return (
      <div className="min-h-screen bg-paper-cream flex items-center justify-center px-4">
        <div className="bg-white border border-champagne-silk/40 rounded-sm w-full max-w-[420px]">
          <div className="h-[2px] bg-cinematic-gold" />
          <div className="px-10 py-16 flex flex-col items-center gap-4">
            <Loader2 className="size-6 animate-spin text-cinematic-gold" />
            <p className="text-[13px] text-charcoal-ink/50">Verifying reset link…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-paper-cream flex items-center justify-center px-4">
        <div className="bg-white border border-champagne-silk/40 rounded-sm w-full max-w-[420px]">
          <div className="h-[2px] bg-cinematic-gold" />
          <div className="px-10 pt-12 pb-10 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="h-14 w-14 rounded-full bg-cinematic-gold/10 border border-cinematic-gold/30 flex items-center justify-center">
                <CheckCircle className="size-7 text-cinematic-gold" />
              </div>
            </div>
            <h1
              className="text-[28px] leading-tight text-charcoal-ink mb-3"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
            >
              Password Updated
            </h1>
            <p className="text-[13px] text-charcoal-ink/50 mb-8 leading-relaxed">
              Your password has been reset successfully. You can now sign in with your
              new credentials.
            </p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full bg-charcoal-ink text-paper-cream py-3 rounded-sm text-[13px] font-medium uppercase tracking-[0.08em] hover:bg-charcoal-ink/90 transition-colors duration-300"
            >
              Return to Sign In
            </button>
          </div>

          <div className="border-t border-champagne-silk/20 px-10 py-5 text-center">
            <img
              src="/dreamweavers-logo.png"
              alt="Dreamweavers"
              className="h-5 w-auto mx-auto mb-3 opacity-40"
            />
            <p className="text-[11px] text-charcoal-ink/30 uppercase tracking-[0.12em] font-semibold">
              © 2026 DREAMWEAVERS DIGITAL HEIRLOOMS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state (no/invalid token) ─────────────────────────────
  if (error && !token) {
    return (
      <div className="min-h-screen bg-paper-cream flex items-center justify-center px-4">
        <div className="bg-white border border-champagne-silk/40 rounded-sm w-full max-w-[420px]">
          <div className="h-[2px] bg-cinematic-gold" />
          <div className="px-10 pt-12 pb-10 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="h-14 w-14 rounded-full bg-cinematic-gold/5 border border-cinematic-gold/20 flex items-center justify-center">
                <AlertCircle className="size-7 text-charcoal-ink/40" />
              </div>
            </div>
            <h1
              className="text-[28px] leading-tight text-charcoal-ink mb-3"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
            >
              Link Expired
            </h1>
            <p className="text-[13px] text-charcoal-ink/50 mb-8 leading-relaxed">
              {error}
            </p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full bg-charcoal-ink text-paper-cream py-3 rounded-sm text-[13px] font-medium uppercase tracking-[0.08em] hover:bg-charcoal-ink/90 transition-colors duration-300"
            >
              Return to Sign In
            </button>
          </div>

          <div className="border-t border-champagne-silk/20 px-10 py-5 text-center">
            <img
              src="/dreamweavers-logo.png"
              alt="Dreamweavers"
              className="h-5 w-auto mx-auto mb-3 opacity-40"
            />
            <p className="text-[11px] text-charcoal-ink/30 uppercase tracking-[0.12em] font-semibold">
              © 2026 DREAMWEAVERS DIGITAL HEIRLOOMS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Reset password form ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-paper-cream flex items-center justify-center px-4">
      <div className="bg-white border border-champagne-silk/40 rounded-sm w-full max-w-[420px]">
        {/* Gold accent top bar */}
        <div className="h-[2px] bg-cinematic-gold" />

        <div className="px-10 pt-10 pb-8">
          {/* Branding */}
          <div className="text-center mb-8">
            {/* Diamond ornament */}
            <div className="flex items-center justify-center mb-5">
              <div className="w-8 h-px bg-cinematic-gold/60" />
              <svg
                className="mx-3 text-cinematic-gold"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M6 0L12 6L6 12L0 6Z" />
              </svg>
              <div className="w-8 h-px bg-cinematic-gold/60" />
            </div>

            <h1
              className="text-[28px] leading-tight text-charcoal-ink"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
            >
              Reset Password
            </h1>
            <p className="text-[13px] text-charcoal-ink/50 mt-2 tracking-wide">
              Enter your new password below.
            </p>
          </div>

          {error && token && (
            <div className="bg-cinematic-gold/5 border border-cinematic-gold/20 px-4 py-3 rounded-sm text-[13px] text-charcoal-ink/80 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="new-password"
                className="block text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/50 font-semibold mb-2"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/50 font-semibold mb-2"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                !newPassword ||
                !confirmPassword ||
                newPassword.length < 8 ||
                confirmPassword.length < 8
              }
              className="w-full bg-charcoal-ink text-paper-cream py-3 rounded-sm text-[13px] font-medium uppercase tracking-[0.08em] hover:bg-charcoal-ink/90 transition-colors duration-300 disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin inline mr-1.5" />
                  Resetting…
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="text-center pt-5">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-[12px] text-charcoal-ink/40 hover:text-cinematic-gold transition-colors duration-200 mx-auto"
            >
              <ArrowLeft className="size-3" />
              Back to Sign In
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-champagne-silk/20 px-10 py-5 text-center">
          <img
            src="/dreamweavers-logo.png"
            alt="Dreamweavers"
            className="h-5 w-auto mx-auto mb-3 opacity-40"
          />
          <p className="text-[11px] text-charcoal-ink/30 uppercase tracking-[0.12em] font-semibold">
            © 2026 DREAMWEAVERS DIGITAL HEIRLOOMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper-cream flex items-center justify-center">
          <div className="bg-white border border-champagne-silk/40 rounded-sm w-full max-w-[420px]">
            <div className="h-[2px] bg-cinematic-gold" />
            <div className="px-10 py-16 flex flex-col items-center gap-4">
              <Loader2 className="size-6 animate-spin text-cinematic-gold" />
              <p className="text-[13px] text-charcoal-ink/50">Loading…</p>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}