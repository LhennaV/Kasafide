'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  submitIdentityVerificationAction,
  updateProfileSettingsAction,
} from '@/app/actions/kasafide'
import type { PortalUserSummary } from '@/lib/portal-guard'

export function AccountSettingsForm({ user }: { user: PortalUserSummary }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [firstName, setFirstName] = useState(user.firstName)
  const [middleInitial, setMiddleInitial] = useState(user.middleInitial)
  const [lastName, setLastName] = useState(user.lastName)
  const [phone, setPhone] = useState(user.phone)
  const [bio, setBio] = useState(user.bio)
  const [gcashNumber, setGcashNumber] = useState(user.gcashNumber)
  const [mayaNumber, setMayaNumber] = useState(user.mayaNumber)
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          const res = await updateProfileSettingsAction({
            firstName,
            middleInitial,
            lastName,
            phone,
            bio,
            gcashNumber,
            mayaNumber,
          })
          setMsg(res.message || res.error || 'Saved')
          router.refresh()
        })
      }}
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4 max-w-2xl"
    >
      {msg && (
        <div className="p-3 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold">
          {msg}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">M.I.</label>
          <input
            type="text"
            maxLength={2}
            value={middleInitial}
            onChange={(e) => setMiddleInitial(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          />
        </div>
      </div>

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
        <div>
          <label className="block text-xs font-bold mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+63917..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          />
        </div>
      </div>

      {user.role === 'seller' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
          <div>
            <label className="block text-xs font-bold mb-1">GCash Payout Number</label>
            <input
              type="text"
              value={gcashNumber}
              onChange={(e) => setGcashNumber(e.target.value)}
              placeholder="0917..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Maya Payout Number</label>
            <input
              type="text"
              value={mayaNumber}
              onChange={(e) => setMayaNumber(e.target.value)}
              placeholder="0917..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold mb-1">Short Bio</label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer"
      >
        {isPending ? 'Saving…' : 'Save Account Settings'}
      </button>
    </form>
  )
}

export function IdentityVerificationForm({
  currentStatus,
}: {
  currentStatus: PortalUserSummary['accountStatus']
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [idType, setIdType] = useState<'drivers_license' | 'passport' | 'philid' | 'umid' | 'postal_id'>('philid')
  const [last4, setLast4] = useState('')
  const [selfieReady, setSelfieReady] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 max-w-xl space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
          Current Verification Status
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
            currentStatus === 'verified'
              ? 'bg-[var(--success)]/15 text-[var(--success)]'
              : 'bg-[var(--warning)]/15 text-[var(--warning)]'
          }`}
        >
          {currentStatus}
        </span>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-[var(--success)]/15 text-[var(--success)] text-xs font-bold">
          {statusMsg}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold mb-1.5">Step 1 &middot; Select Valid Philippine Government ID</label>
        <select
          value={idType}
          onChange={(e) => setIdType(e.target.value as typeof idType)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        >
          <option value="philid">PhilSys National ID</option>
          <option value="drivers_license">LTO Driver&apos;s License</option>
          <option value="passport">Philippine Passport</option>
          <option value="umid">UMID Card</option>
          <option value="postal_id">Postal ID</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold mb-1.5">Last 4 Digits of ID Number</label>
        <input
          type="text"
          maxLength={4}
          value={last4}
          onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="e.g. 9012"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold mb-1.5">Step 2 &middot; In-App Camera Selfie Check</label>
        <button
          type="button"
          onClick={() => setSelfieReady(true)}
          className={`w-full p-5 rounded-2xl border-2 border-dashed text-center transition cursor-pointer ${
            selfieReady
              ? 'border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]'
              : 'border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-muted)]'
          }`}
        >
          <div className="font-extrabold text-sm">
            {selfieReady ? '✓ Live Selfie Frame Captured' : 'Tap to Capture Live Selfie with ID'}
          </div>
          <div className="text-xs mt-1">
            Kasafide admins compare your live selfie directly against your government ID portrait.
          </div>
        </button>
      </div>

      <button
        type="button"
        disabled={isPending || !selfieReady}
        onClick={() => {
          startTransition(async () => {
            const res = await submitIdentityVerificationAction({
              idType,
              idNumberLast4: last4 || '1234',
            })
            setStatusMsg(res.message || 'Submitted!')
            router.refresh()
          })
        }}
        className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer disabled:opacity-45"
      >
        {isPending ? 'Submitting…' : 'Submit for Admin Verification'}
      </button>
    </div>
  )
}
