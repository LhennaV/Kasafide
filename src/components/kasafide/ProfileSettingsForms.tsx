'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { changePasswordAction, updateProfileSettingsAction } from '@/app/actions/kasafide'
import type { PortalUserSummary } from '@/lib/portal-guard'
import { toast } from '@/lib/toast'

export { IdentityVerificationForm } from './IdentityVerificationForm'

const FAILED = { ok: false, error: 'Could not reach the server. Please try again.' } as const

/** Keeps only digits, plus one leading "+", so letters can't be typed into a number field. */
function phoneChars(value: string): string {
  const plus = value.trimStart().startsWith('+') ? '+' : ''
  return (plus + value.replace(/\D/g, '')).slice(0, 13)
}

/** 09XXXXXXXXX or +639XXXXXXXXX. Empty is allowed (the field is optional). */
function phoneError(value: string): string {
  if (!value) return ''
  return /^(09\d{9}|\+639\d{9})$/.test(value) ? '' : 'Use 11 digits like 09171234567, or +639171234567.'
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm'

export function AccountSettingsForm({ user }: { user: PortalUserSummary }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const initial = {
    firstName: user.firstName,
    middleInitial: user.middleInitial,
    lastName: user.lastName,
    phone: user.phone,
    bio: user.bio,
  }
  const [saved, setSaved] = useState(initial)
  const [form, setForm] = useState(initial)
  const set = (key: keyof typeof initial) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const changed = (Object.keys(form) as Array<keyof typeof form>).some(
    (k) => (form[k] || '').trim() !== (saved[k] || '').trim(),
  )
  const errors = {
    phone: phoneError(form.phone),
    name: !form.firstName.trim() || !form.lastName.trim() ? 'First and last name are required.' : '',
  }
  const hasError = Object.values(errors).some(Boolean)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!changed || hasError) return
        startTransition(async () => {
          const res = await updateProfileSettingsAction(form).catch(() => FAILED)
          toast.result(res, 'Saved')
          if (res.ok) {
            setSaved(form)
            router.refresh()
          }
        })
      }}
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4 w-full"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_6rem_1fr] gap-3">
        <div>
          <label className="block text-xs font-bold mb-1">First Name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => set('firstName')(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">M.I.</label>
          <input
            type="text"
            maxLength={2}
            value={form.middleInitial}
            onChange={(e) => set('middleInitial')(e.target.value.replace(/[^A-Za-z.]/g, ''))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Last Name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => set('lastName')(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      {errors.name && <p className="text-xs font-bold text-[var(--danger)]">{errors.name}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold mb-1">Email (Account ID)</label>
          <input
            type="email"
            disabled
            value={user.email}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-sm opacity-75"
          />
        </div>
        <PhoneField
          label="Phone Number"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
          placeholder="09171234567"
        />
      </div>

      {user.role === 'seller' && (
        <p className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
          Where buyers pay you (e-wallet or bank) is set in{' '}
          <Link href="/module/seller/payments" className="font-bold text-[var(--primary)]">
            Payments &rarr; Payout Settings
          </Link>
          .
        </p>
      )}

      <div>
        <label className="block text-xs font-bold mb-1">Short Bio</label>
        <textarea
          rows={3}
          maxLength={500}
          value={form.bio}
          onChange={(e) => set('bio')(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !changed || hasError}
          className="px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving…' : 'Save Account Settings'}
        </button>
        {changed && !isPending && (
          <button
            type="button"
            onClick={() => setForm(saved)}
            className="px-4 py-3 rounded-xl border border-[var(--border)] text-sm font-bold cursor-pointer"
          >
            Discard changes
          </button>
        )}
        {!changed && <span className="text-xs text-[var(--text-muted)]">No changes to save.</span>}
      </div>
    </form>
  )
}

function PhoneField({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error: string
  placeholder: string
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1">{label}</label>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        onChange={(e) => onChange(phoneChars(e.target.value))}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`${inputClass} ${error ? 'border-[var(--danger)]' : ''}`}
      />
      {error && <p className="text-[11px] font-bold text-[var(--danger)] mt-1">{error}</p>}
    </div>
  )
}

const PASSWORD_MIN = 8

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  // Nothing typed yet (or a field still empty) → nothing to update.
  const filled = Boolean(current && next && confirm)

  return (
    <form
      id="change-password"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setError('')
        if (!current) return setError('Enter your current password.')
        if (next.length < PASSWORD_MIN) return setError(`Use at least ${PASSWORD_MIN} characters.`)
        if (next !== confirm) return setError('The new passwords do not match.')
        if (next === current) return setError('The new password must be different from the current one.')
        startTransition(async () => {
          const res = await changePasswordAction({
            currentPassword: current,
            newPassword: next,
          }).catch(() => FAILED)
          if (!res.ok) {
            setError(res.error || 'Could not update your password.')
            return
          }
          toast.success(res.message || 'Password updated.')
          setCurrent('')
          setNext('')
          setConfirm('')
        })
      }}
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4 w-full scroll-mt-24"
    >
      <div>
        <h2 className="text-base font-extrabold text-[var(--text)]">Change Password</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Use at least {PASSWORD_MIN} characters. You&apos;ll stay signed in on this device.{' '}
          <a href="/auth/forgot-password" className="font-bold text-[var(--primary)] hover:underline">
            Forgot your current password?
          </a>
        </p>
      </div>

      <div>
        <label htmlFor="currentPassword" className="block text-xs font-bold mb-1">
          Current Password
        </label>
        <input
          id="currentPassword"
          type={show ? 'text' : 'password'}
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="newPassword" className="block text-xs font-bold mb-1">
            New Password
          </label>
          <input
            id="newPassword"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="confirmNewPassword" className="block text-xs font-bold mb-1">
            Confirm New Password
          </label>
          <input
            id="confirmNewPassword"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] cursor-pointer">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
        Show passwords
      </label>

      {error && (
        <p role="alert" className="text-xs font-bold text-[var(--danger)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !filled}
        className="px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
      >
        {isPending ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  )
}
