'use client'

import { useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRightLeft } from 'lucide-react'
import { useAuthModalStore } from '@/store/useAuthModalStore'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else {
        // Successful login — close the modal
        useAuthModalStore.getState().closeModal()
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchAccount = async () => {
    setIsLoading(true)
    // The modal stays open via Zustand store; signOut just clears the session
    await signOut({ redirect: false })
    setIsLoading(false)
  }

  // Determine if this is a "switch account" scenario
  const isAlreadyAuthenticated = status === 'authenticated' && session
  const currentRole = session?.user?.role
  const roleLabel = currentRole === 'SUPER_ADMIN' || currentRole === 'ACCOUNT_MANAGER' ? 'Admin' : 'Couple'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden border-slate-200 bg-white">
        {/* Header */}
        <div className="bg-slate-900 px-6 pt-8 pb-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-semibold text-white">
              {isAlreadyAuthenticated ? 'Switch Account' : 'Welcome back'}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm mt-1.5">
              {isAlreadyAuthenticated
                ? 'Sign out first, then sign in with a different account'
                : 'Sign in to the Dreamweavers CMS'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Currently signed in — show info + switch button */}
        {isAlreadyAuthenticated && (
          <div className="p-6 space-y-4">
            {/* Current session card */}
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-bold">
                {(session.user?.name ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{session.user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
              </div>
              <span className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                currentRole === 'SUPER_ADMIN' || currentRole === 'ACCOUNT_MANAGER'
                  ? 'bg-slate-900 text-white'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {roleLabel}
              </span>
            </div>

            {/* Switch Account button */}
            <Button
              type="button"
              onClick={handleSwitchAccount}
              disabled={isLoading}
              className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing out…
                </>
              ) : (
                <>
                  <ArrowRightLeft className="size-4" />
                  Sign Out & Switch Account
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400">or sign in directly</span>
              </div>
            </div>

            {/* Inline login form for quick switch */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="switch-email" className="text-xs font-medium text-slate-600">
                  Different email
                </Label>
                <Input
                  id="switch-email"
                  type="email"
                  placeholder="other@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  className="h-9 border-slate-300 bg-white text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="switch-password" className="text-xs font-medium text-slate-600">
                  Password
                </Label>
                <Input
                  id="switch-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="h-9 border-slate-300 bg-white text-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                variant="outline"
                className="w-full h-9 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Standard login form — only when not authenticated */}
        {!isAlreadyAuthenticated && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error */}
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="login-email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="h-10 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-900/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="login-password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="h-10 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-900/20"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 text-center">
          <p className="text-xs text-slate-400">
            © 2025 Dreamweavers PTL. All rights reserved.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}