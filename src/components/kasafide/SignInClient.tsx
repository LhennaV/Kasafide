'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { announceSessionChange } from '@/lib/app-session-browser'
import { GoogleAuthButton } from './GoogleAuthButton'
import { KasafideLogo } from './KasafideLogo'
import { ThemeToggle } from './ThemeToggle'

export function SignInClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect') || ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/app-auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        redirectTo?: string
      }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Invalid email or password.')
        setBusy(false)
        return
      }
      await announceSessionChange(router)
      router.push(redirectParam || data.redirectTo || '/module/buyer')
    } catch {
      setError('Unable to sign in right now. Please try again.')
      setBusy(false)
    }
  }

  async function signInDemoRole(demoRole: 'buyer' | 'seller' | 'admin' | 'superadmin') {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/app-auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ demoRole }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; redirectTo?: string }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Demo sign-in failed.')
        setBusy(false)
        return
      }
      await announceSessionChange(router)
      router.push(redirectParam || data.redirectTo || '/module/buyer')
    } catch {
      setError('Demo sign-in failed.')
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 py-12 sm:px-8 overflow-hidden bg-[var(--bg)]">
      {/* Atmospheric Blurred Listing Photo Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <Image
          src="/assets/img/house_image.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25 blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg)]/90 via-[var(--surface)]/75 to-[var(--bg)]/90" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left Marketing Tagline (Desktop, preserved from signin.html) */}
      <div className="hidden lg:block relative z-10 max-w-sm mr-16">
        <h2 className="text-4xl font-black leading-tight text-[var(--text)] mb-4">
          No hidden listings.
          <br />
          <span className="text-[var(--primary)]">No unverified sellers.</span>
        </h2>
        <p className="text-sm text-[var(--text-soft)] leading-relaxed">
          Kasafide connects buyers and renters with verified property owners across all 24 barangays of Sta. Maria, Bulacan.
        </p>
      </div>

      {/* Floating Glass Auth Card */}
      <div className="relative z-10 w-full max-w-[430px] rounded-3xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl p-7 sm:p-8 shadow-2xl">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-extrabold text-lg text-[var(--text)] mb-5"
        >
          <KasafideLogo size={28} />
          <span>Kasafide</span>
        </Link>

        <h1 className="text-2xl font-black text-center text-[var(--text)] mb-1">Welcome Back</h1>
        <p className="text-xs sm:text-sm text-center text-[var(--text-muted)] mb-6">
          Sign in to access your Kasafide account
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--danger)]/15 border border-[var(--danger)]/35 text-xs font-semibold text-[var(--danger)]">
            {error}
          </div>
        )}

        <form onSubmit={submitCredentials} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text)] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text)] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)]"
              />
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer text-xs font-bold"
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-bold text-[var(--primary)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] font-extrabold text-sm transition cursor-pointer disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <span className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-muted)]">or</span>
          <span className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Google Sign-In Button */}
        <GoogleAuthButton mode="signin" redirectTo={redirectParam || undefined} />

        {/* Quick Role Switcher for Reviewing All 4 Kasafide Roles */}
        <div className="mt-5 pt-4 border-t border-[var(--border)]/70">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-center text-[var(--text-muted)] mb-2.5">
            Instant Demo Role Preview
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => signInDemoRole('buyer')}
              className="py-2 px-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/80 hover:border-[var(--primary)] text-xs font-bold text-[var(--text)] cursor-pointer"
            >
              Buyer / Renter
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => signInDemoRole('seller')}
              className="py-2 px-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/80 hover:border-[var(--primary)] text-xs font-bold text-[var(--text)] cursor-pointer"
            >
              Verified Seller
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => signInDemoRole('admin')}
              className="py-2 px-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/80 hover:border-[var(--primary)] text-xs font-bold text-[var(--text)] cursor-pointer"
            >
              Admin Moderator
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => signInDemoRole('superadmin')}
              className="py-2 px-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/80 hover:border-[var(--primary)] text-xs font-bold text-[var(--text)] cursor-pointer"
            >
              Super Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-extrabold text-[var(--primary)] hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <footer className="relative z-10 lg:absolute lg:bottom-5 mt-8 lg:mt-0 flex items-center gap-6 text-xs text-[var(--text-muted)]">
        <span>&copy; 2026 Kasafide</span>
        <Link href="/terms" className="hover:text-[var(--primary)]">
          Terms
        </Link>
        <Link href="/privacy-policy" className="hover:text-[var(--primary)]">
          Privacy
        </Link>
      </footer>
    </div>
  )
}
