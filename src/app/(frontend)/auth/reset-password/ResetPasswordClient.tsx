'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KasafideLogo } from '@/components/kasafide/KasafideLogo'

const MIN_LENGTH = 8

export function ResetPasswordClient({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) {
        // An expired or already-used token is the usual cause; Payload reports it as a 4xx.
        setError(
          res.status < 500
            ? 'This reset link has expired or was already used. Please request a new one.'
            : 'We could not update your password right now. Please try again.',
        )
        return
      }
      setDone(true)
    } catch {
      setError('We could not update your password right now. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--bg)]">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-extrabold text-lg mb-6"
        >
          <KasafideLogo size={28} />
          <span>Kasafide</span>
        </Link>

        {!token ? (
          <div className="text-center space-y-3">
            <h1 className="text-xl font-black text-[var(--text)]">Reset Link Missing</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Open the link from your reset email again, or request a new one.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-block mt-3 px-6 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm"
            >
              Request a New Link
            </Link>
          </div>
        ) : done ? (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center mx-auto font-black text-xl">
              ✓
            </div>
            <h1 className="text-xl font-black text-[var(--text)]">Password Updated</h1>
            <p className="text-sm text-[var(--text-muted)]">
              You can now sign in with your new password.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block mt-3 px-6 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!saving) void submit()
            }}
            className="space-y-4"
            noValidate
          >
            <h1 className="text-2xl font-black text-center text-[var(--text)]">
              Choose a New Password
            </h1>
            <p className="text-xs sm:text-sm text-center text-[var(--text-muted)]">
              Use at least {MIN_LENGTH} characters. You&apos;ll sign in with this from now on.
            </p>
            <div>
              <label htmlFor="newPassword" className="block text-xs font-bold mb-1.5">
                New Password
              </label>
              <input
                id="newPassword"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={MIN_LENGTH}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] cursor-pointer">
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
              Show passwords
            </label>
            {error && (
              <p role="alert" className="text-xs font-bold text-center text-[var(--danger)]">
                {error}{' '}
                {error.includes('expired') && (
                  <Link href="/auth/forgot-password" className="underline">
                    Request a new link
                  </Link>
                )}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
