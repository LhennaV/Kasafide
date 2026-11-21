'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KasafideLogo } from '@/components/kasafide/KasafideLogo'

export function ForgotPasswordClient() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--bg)]">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl">
        <Link href="/" className="flex items-center justify-center gap-2 font-extrabold text-lg mb-6">
          <KasafideLogo size={28} />
          <span>Kasafide</span>
        </Link>

        {sent ? (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center mx-auto font-black text-xl">
              ✓
            </div>
            <h1 className="text-xl font-black text-[var(--text)]">Check Your Inbox</h1>
            <p className="text-sm text-[var(--text-muted)]">
              If an account exists for <strong className="text-[var(--text)]">{email}</strong>, password recovery instructions have been queued.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block mt-3 px-6 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (email.includes('@')) setSent(true)
            }}
            className="space-y-4"
          >
            <h1 className="text-2xl font-black text-center text-[var(--text)]">Forgot Password?</h1>
            <p className="text-xs sm:text-sm text-center text-[var(--text-muted)]">
              Enter your registered Kasafide email address and we&apos;ll help you regain access.
            </p>
            <div>
              <label className="block text-xs font-bold mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer"
            >
              Send Recovery Instructions
            </button>
            <div className="text-center pt-1">
              <Link href="/auth/signin" className="text-xs font-bold text-[var(--primary)] hover:underline">
                &larr; Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
