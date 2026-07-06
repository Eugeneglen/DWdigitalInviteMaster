'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
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
import { Loader2 } from 'lucide-react'

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

  // Close modal on successful login
  useEffect(() => {
    if (status === 'authenticated' && session) {
      onOpenChange(false)
    }
  }, [status, session, onOpenChange])

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
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden border-slate-200 bg-white">
        {/* Header */}
        <div className="bg-slate-900 px-6 pt-8 pb-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-semibold text-white">
              Welcome back
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm mt-1.5">
              Sign in to the Dreamweavers CMS
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
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