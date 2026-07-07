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
import { Loader2, LogOut, Eye, EyeOff } from 'lucide-react';
import { useAuthModalStore } from '@/store/useAuthModalStore';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Visual variant — 'cms' uses a dark charcoal theme, 'default' uses the light cream theme */
  variant?: 'default' | 'cms';
}

export function LoginModal({ open, onOpenChange, variant = 'default' }: LoginModalProps) {
  const isCMS = variant === 'cms';
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use NextAuth's built-in signIn — handles CSRF, JWT creation, and cookie setting
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        // Login successful — close modal and reload to pick up session
        useAuthModalStore.getState().closeModal();
        window.location.reload();
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

  // Shared input class for dark variant
  const darkInputClass = '!text-paper-cream placeholder:!text-paper-cream/25 !border-paper-cream/15';
  const darkLabelClass = 'text-paper-cream/40';
  const lightLabelClass = 'text-charcoal-ink/50';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName={isCMS ? '!bg-[#1A1410]' : '!bg-paper-cream'}
        showCloseButton={false}
        className="!bg-transparent !border-0 !shadow-none !max-w-[420px] !p-0 !gap-0 !rounded-none"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div
          className={
            isCMS
              ? 'bg-[#1E1816] border border-cinematic-gold/20 rounded-sm'
              : 'bg-white border border-champagne-silk/40 rounded-sm'
          }
        >
          {/* Gold accent top bar */}
          <div className={`h-[2px] ${isCMS ? 'bg-cinematic-gold/60' : 'bg-cinematic-gold'}`} />

          <div className="px-10 pt-10 pb-8">
            {/* Branding */}
            <div className="text-center mb-8">
              {/* Diamond ornament */}
              <div className="flex items-center justify-center mb-5">
                <div className={`w-8 h-px ${isCMS ? 'bg-cinematic-gold/35' : 'bg-cinematic-gold/60'}`} />
                <svg
                  className={`mx-3 text-cinematic-gold ${isCMS ? 'opacity-60' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                >
                  <path d="M6 0L12 6L6 12L0 6Z" />
                </svg>
                <div className={`w-8 h-px ${isCMS ? 'bg-cinematic-gold/35' : 'bg-cinematic-gold/60'}`} />
              </div>

              <DialogHeader className="text-center">
                <DialogTitle
                  className={`text-[28px] leading-tight ${isCMS ? 'text-paper-cream' : 'text-charcoal-ink'}`}
                  style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
                >
                  {isAlreadyAuthenticated ? 'Switch Account' : isCMS ? 'Admin Portal' : 'Welcome Back'}
                </DialogTitle>
                <DialogDescription className={`text-[13px] mt-2 tracking-wide ${isCMS ? 'text-paper-cream/35' : 'text-charcoal-ink/50'}`}>
                  {isAlreadyAuthenticated
                    ? 'Sign out first, then sign in with a different account'
                    : isCMS
                      ? 'Sign in to the CMS Dashboard'
                      : 'Sign in to Dreamweavers Digital Heirlooms'}
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Switch Account — authenticated state */}
            {isAlreadyAuthenticated && (
              <div className="space-y-5">
                {/* Current session card */}
                <div className={`flex items-center gap-4 border p-4 rounded-sm ${
                  isCMS ? 'border-cinematic-gold/15 bg-paper-cream/5' : 'border-champagne-silk/30 bg-paper-cream/50'
                }`}>
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
                      className={`text-[15px] font-medium truncate ${isCMS ? 'text-paper-cream' : 'text-charcoal-ink'}`}
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {session.user?.name}
                    </p>
                    <p className={`text-[12px] truncate mt-0.5 ${isCMS ? 'text-paper-cream/30' : 'text-charcoal-ink/50'}`}>
                      {session.user?.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-sm uppercase tracking-[0.12em] ${
                      currentRole === 'SUPER_ADMIN' || currentRole === 'ACCOUNT_MANAGER'
                        ? isCMS
                          ? 'bg-cinematic-gold/15 text-cinematic-gold border border-cinematic-gold/30'
                          : 'bg-charcoal-ink text-paper-cream'
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
                  className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-sm text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 ${
                    isCMS
                      ? 'bg-cinematic-gold/15 text-cinematic-gold border border-cinematic-gold/30 hover:bg-cinematic-gold/25'
                      : 'bg-charcoal-ink text-paper-cream hover:bg-charcoal-ink/90'
                  }`}
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
                  <div className={`flex-1 border-t ${isCMS ? 'border-paper-cream/8' : 'border-champagne-silk/30'}`} />
                  <span className={`text-[11px] uppercase tracking-[0.15em] ${isCMS ? 'text-paper-cream/18' : 'text-charcoal-ink/30'}`}>
                    or sign in directly
                  </span>
                  <div className={`flex-1 border-t ${isCMS ? 'border-paper-cream/8' : 'border-champagne-silk/30'}`} />
                </div>

                {/* Inline login for quick switch */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className={`border px-4 py-3 rounded-sm text-[13px] ${
                      isCMS ? 'bg-cinematic-gold/10 border-cinematic-gold/25 text-paper-cream/80' : 'bg-cinematic-gold/5 border-cinematic-gold/20 text-charcoal-ink/80'
                    }`}>
                      {error}
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="switch-email"
                      className={`block text-[11px] tracking-[0.18em] uppercase font-semibold mb-2 ${isCMS ? darkLabelClass : lightLabelClass}`}
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
                      className={`input-line !text-[15px] !font-sans ${isCMS ? darkInputClass : ''}`}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="switch-password"
                      className={`block text-[11px] tracking-[0.18em] uppercase font-semibold mb-2 ${isCMS ? darkLabelClass : lightLabelClass}`}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="switch-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        autoComplete="current-password"
                        className={`input-line !text-[15px] !font-sans pr-10 ${isCMS ? darkInputClass : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 transition-colors duration-200 ${
                          isCMS ? 'text-paper-cream/25 hover:text-paper-cream/50' : 'text-charcoal-ink/30 hover:text-charcoal-ink/60'
                        }`}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword
                          ? <EyeOff className="size-4" />
                          : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className={`w-full py-3 rounded-sm text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 disabled:opacity-40 ${
                      isCMS
                        ? 'bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90'
                        : 'bg-charcoal-ink text-paper-cream hover:bg-charcoal-ink/90'
                    }`}
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
                  <div className={`border px-4 py-3 rounded-sm text-[13px] ${
                    isCMS ? 'bg-cinematic-gold/10 border-cinematic-gold/25 text-paper-cream/80' : 'bg-cinematic-gold/5 border-cinematic-gold/20 text-charcoal-ink/80'
                  }`}>
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="login-email"
                    className={`block text-[11px] tracking-[0.18em] uppercase font-semibold mb-2 ${isCMS ? darkLabelClass : lightLabelClass}`}
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
                    className={`input-line !text-[15px] !font-sans placeholder:text-charcoal-ink/30 ${isCMS ? darkInputClass : ''}`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className={`block text-[11px] tracking-[0.18em] uppercase font-semibold mb-2 ${isCMS ? darkLabelClass : lightLabelClass}`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                      className={`input-line !text-[15px] !font-sans placeholder:text-charcoal-ink/30 pr-10 ${isCMS ? darkInputClass : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 transition-colors duration-200 ${
                        isCMS ? 'text-paper-cream/25 hover:text-paper-cream/50' : 'text-charcoal-ink/30 hover:text-charcoal-ink/60'
                      }`}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword
                        ? <EyeOff className="size-4" />
                        : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className={`w-full py-3 rounded-sm text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 disabled:opacity-40 ${
                    isCMS
                      ? 'bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90'
                      : 'bg-charcoal-ink text-paper-cream hover:bg-charcoal-ink/90'
                  }`}
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
          <div className={`border-t px-10 py-5 text-center ${isCMS ? 'border-paper-cream/8' : 'border-champagne-silk/20'}`}>
            <img
              src="/dreamweavers-logo.png"
              alt="Dreamweavers"
              className={`h-5 w-auto mx-auto mb-3 ${isCMS ? 'opacity-25 brightness-0 invert' : 'opacity-40'}`}
            />
            <p
              className={`text-[11px] uppercase tracking-[0.12em] font-semibold ${isCMS ? 'text-paper-cream/15' : 'text-charcoal-ink/30'}`}
            >
              © 2026 DREAMWEAVERS DIGITAL HEIRLOOMS. All rights reserved.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}