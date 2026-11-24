'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { announceSessionChange } from '@/lib/app-session-browser'
import { GoogleAuthButton } from './GoogleAuthButton'
import { KasafideLogo } from './KasafideLogo'

export function SignUpClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [middleInitial, setMiddleInitial] = useState('')
  const [email, setEmail] = useState('')
  const [phoneLocal, setPhoneLocal] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('role') === 'seller') {
      setRole('seller')
    }
  }, [searchParams])

  async function submitSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!agreed) {
      setError('Please agree to Kasafide Terms of Service and Privacy Policy.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPw) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/app-auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          role,
          firstName,
          lastName,
          middleInitial,
          email,
          phone: phoneLocal,
          password,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; redirectTo?: string }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Could not create account.')
        setBusy(false)
        return
      }
      await announceSessionChange(router)
      router.push(data.redirectTo || (role === 'seller' ? '/module/seller' : '/module/buyer'))
    } catch {
      setError('Network error while creating your account.')
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 py-12 sm:px-8 overflow-hidden bg-[var(--bg)]">
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

      {/* Left Tagline (Preserved from signup.html) */}
      <div className="hidden lg:block relative z-10 max-w-sm mr-14">
        <h2 className="text-4xl font-black leading-tight text-[var(--text)] mb-4">
          Find your home,
          <br />
          <span className="text-[var(--primary)]">the verified way.</span>
        </h2>
        <p className="text-sm text-[var(--text-soft)] leading-relaxed">
          Every seller is ID-checked and every listing is reviewed before it ever reaches public browse.
        </p>
      </div>

      {/* Wide Frosted Glass Sign-Up Card */}
      <div className="relative z-10 w-full max-w-[520px] rounded-3xl border border-[var(--border)] bg-[var(--surface)]/92 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-extrabold text-lg text-[var(--text)] mb-4"
        >
          <KasafideLogo size={28} />
          <span>Kasafide</span>
        </Link>

        <h1 className="text-2xl font-black text-center text-[var(--text)] mb-1">
          Create an account
        </h1>
        <p className="text-xs sm:text-sm text-center text-[var(--text-muted)] mb-4">
          Join Kasafide to rent, buy, or list verified properties.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--danger)]/15 border border-[var(--danger)]/35 text-xs font-semibold text-[var(--danger)]">
            {error}
          </div>
        )}

        <form onSubmit={submitSignUp} className="space-y-4">
          {/* Role Toggle: Buyer / Renter vs Seller / Lister */}
          <div>
            <label className="block text-xs font-bold text-[var(--text)] mb-1.5">
              I am registering as a…
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-2.5 px-3 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  role === 'buyer'
                    ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                ✓ Buyer / Renter
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`py-2.5 px-3 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  role === 'seller'
                    ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                Seller / Lister
              </button>
            </div>
          </div>

          {/* Name Row: Surname, First Name, M.I. */}
          <div>
            <label className="block text-xs font-bold text-[var(--text)] mb-1.5">Name</label>
            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Surname"
                className="col-span-5 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="col-span-5 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
              <input
                type="text"
                maxLength={2}
                value={middleInitial}
                onChange={(e) => setMiddleInitial(e.target.value)}
                placeholder="M.I."
                className="col-span-2 px-2.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-center"
              />
            </div>
          </div>

          {/* Email & +63 Phone Pair */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text)] mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text)] mb-1.5">
                Phone Number
              </label>
              <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden">
                <span className="pl-3 pr-1.5 text-xs font-extrabold text-[var(--text-muted)] select-none">
                  +63
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9170000000"
                  className="w-full py-2.5 pr-3 bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password Pair */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text)] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text)] mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] -mt-2">
            Must be at least 8 characters long.
          </p>

          <label className="flex items-start gap-2.5 text-xs text-[var(--text-muted)] cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[var(--primary)]"
            />
            <span>
              I have read and agree to Kasafide&apos;s{' '}
              <Link href="/terms" className="font-bold text-[var(--primary)] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy-policy"
                className="font-bold text-[var(--primary)] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={busy || !agreed}
            className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] font-extrabold text-sm transition cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {busy ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <span className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-muted)]">or</span>
          <span className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Sign Up with Google Button */}
        <GoogleAuthButton mode="signup" preferredRole={role} />

        <p className="text-center text-xs text-[var(--text-muted)] mt-5">
          Already have an account?{' '}
          <Link href="/auth/signin" className="font-extrabold text-[var(--primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
