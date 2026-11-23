'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KasafideLogo } from '@/components/kasafide/KasafideLogo'

export function ForgotPasswordClient() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function requestReset() {
    setError('')
    setSending(true)
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      // Payload answers the same way whether or not the account exists, so the page does too:
      // only a server or network failure is worth telling the visitor about.
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`)
      setSent(true)
    } catch {
      setError('We could not send the email right now. Please try again in a few minutes.')
    } finally {
      setSending(false)
    }
  }

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
              If an account exists for <strong className="text-[var(--text)]">{email}</strong>, we&apos;ve sent a link to reset your password. It works for one hour.
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
              if (email.includes('@') && !sending) void requestReset()
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
            {error && (
              <p role="alert" className="text-xs font-bold text-center text-[var(--danger)]">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send Recovery Instructions'}
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
