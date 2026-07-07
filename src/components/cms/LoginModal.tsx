'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, ArrowRightLeft, LogOut } from 'lucide-react';
import { useAuthModalStore } from '@/store/useAuthModalStore';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        useAuthModalStore.getState().closeModal();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    setIsLoading(true);
    await signOut({ redirect: false });
    setIsLoading(false);
  };

  const isAlreadyAuthenticated = status === 'authenticated' && session;
  const currentRole = session?.user?.role;
  const roleLabel =
    currentRole === 'SUPER_ADMIN' || currentRole === 'ACCOUNT_MANAGER'
      ? 'Admin'
      : 'Couple';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="!bg-paper-cream"
        showCloseButton={false}
        className="!bg-transparent !border-0 !shadow-none !max-w-[420px] !p-0 !gap-0 !rounded-none"
      >
        <div className="bg-white border border-champagne-silk/40 rounded-sm">
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

              <DialogHeader className="text-center">
                <DialogTitle
                  className="text-[28px] leading-tight text-charcoal-ink"
                  style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
                >
                  {isAlreadyAuthenticated ? 'Switch Account' : 'Welcome Back'}
                </DialogTitle>
                <DialogDescription className="text-[13px] text-charcoal-ink/50 mt-2 tracking-wide">
                  {isAlreadyAuthenticated
                    ? 'Sign out first, then sign in with a different account'
                    : 'Sign in to Dreamweavers Digital Heirlooms'}
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Switch Account — authenticated state */}
            {isAlreadyAuthenticated && (
              <div className="space-y-5">
                {/* Current session card */}
                <div className="flex items-center gap-4 border border-champagne-silk/30 bg-paper-cream/50 p-4 rounded-sm">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center border border-cinematic-gold/40 text-cinematic-gold text-sm font-bold rounded-sm"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {(session.user?.name ?? 'U')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[15px] font-medium text-charcoal-ink truncate"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {session.user?.name}
                    </p>
                    <p className="text-[12px] text-charcoal-ink/50 truncate mt-0.5">
                      {session.user?.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-sm uppercase tracking-[0.12em] ${
                      currentRole === 'SUPER_ADMIN' || currentRole === 'ACCOUNT_MANAGER'
                        ? 'bg-charcoal-ink text-paper-cream'
                        : 'bg-cinematic-gold/10 text-cinematic-gold border border-cinematic-gold/30'
                    }`}
                  >
                    {roleLabel}
                  </span>
                </div>

                {/* Sign Out button */}
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 bg-charcoal-ink text-paper-cream py-3 rounded-sm text-[13px] font-medium uppercase tracking-[0.08em] hover:bg-charcoal-ink/90 transition-colors duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing out…
                    </>
                  ) : (
                    <>
                      <LogOut className="size-3.5" />
                      Sign Out
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t border-champagne-silk/30" />
                  <span className="text-[11px] text-charcoal-ink/30 uppercase tracking-[0.15em]">
                    or sign in directly
                  </span>
                  <div className="flex-1 border-t border-champagne-silk/30" />
                </div>

                {/* Inline login for quick switch */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-cinematic-gold/5 border border-cinematic-gold/20 px-4 py-3 rounded-sm text-[13px] text-charcoal-ink/80">
                      {error}
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="switch-email"
                      className="block text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/50 font-semibold mb-2"
                    >
                      Different email
                    </label>
                    <input
                      id="switch-email"
                      type="email"
                      placeholder="other@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                      className="input-line !text-[15px] !font-sans"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="switch-password"
                      className="block text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/50 font-semibold mb-2"
                    >
                      Password
                    </label>
                    <input
                      id="switch-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="current-password"
                      className="input-line !text-[15px] !font-sans"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full bg-charcoal-ink text-paper-cream py-3 rounded-sm text-[13px] font-medium uppercase tracking-[0.08em] hover:bg-charcoal-ink/90 transition-colors duration-300 disabled:opacity-40"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin inline mr-1.5" />
                        Signing in…
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Standard login form */}
            {!isAlreadyAuthenticated && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-cinematic-gold/5 border border-cinematic-gold/20 px-4 py-3 rounded-sm text-[13px] text-charcoal-ink/80">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/50 font-semibold mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    className="input-line !text-[15px] !font-sans placeholder:text-charcoal-ink/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/50 font-semibold mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="input-line !text-[15px] !font-sans placeholder:text-charcoal-ink/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full bg-charcoal-ink text-paper-cream py-3 rounded-sm text-[13px] font-medium uppercase tracking-[0.08em] hover:bg-charcoal-ink/90 transition-colors duration-300 disabled:opacity-40"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin inline mr-1.5" />
                      Signing in…
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-champagne-silk/20 px-10 py-5 text-center">
            <img
              src="/dreamweavers-logo.png"
              alt="Dreamweavers"
              className="h-5 w-auto mx-auto mb-3 opacity-40"
            />
            <p
              className="text-[11px] text-charcoal-ink/30 uppercase tracking-[0.12em] font-semibold"
            >
              © 2026 DREAMWEAVERS DIGITAL HEIRLOOMS. All rights reserved.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}