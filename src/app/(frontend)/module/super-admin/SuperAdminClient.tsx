'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  adminModerateUserAction,
  superAdminCreateAdminAction,
} from '@/app/actions/kasafide'
import { withToast } from '@/lib/toast'

export type SuperAdminRow = {
  id: string
  fullName: string
  email: string
  role: string
  accountStatus: string
  createdAt: string
}

export function SuperAdminAdminsManager({ admins }: { admins: SuperAdminRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-base text-[var(--text)]">Admin Management</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Manage moderator accounts — provision new admins or toggle status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold cursor-pointer"
        >
          + Add Admin
        </button>
      </div>

      {feedback && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold">
          {feedback}
        </div>
      )}

      <table className="kf-data-table w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase text-[var(--text-muted)]">
            <th className="py-3.5 px-5">Admin</th>
            <th className="py-3.5 px-5">Email</th>
            <th className="py-3.5 px-5">Role</th>
            <th className="py-3.5 px-5">Status</th>
            <th className="py-3.5 px-5">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]/50">
          {admins.map((a) => (
            <tr key={a.id}>
              <td data-label="Admin" className="py-3.5 px-5 font-extrabold">
                {a.fullName}
              </td>
              <td data-label="Email" className="py-3.5 px-5 text-xs text-[var(--text-muted)]">
                {a.email}
              </td>
              <td data-label="Role" className="py-3.5 px-5 text-xs font-bold uppercase">
                {a.role === 'super_duper_admin' ? 'Super Admin' : a.role}
              </td>
              <td data-label="Status" className="py-3.5 px-5">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-extrabold capitalize ${
                    a.accountStatus === 'suspended'
                      ? 'bg-[var(--danger)]/15 text-[var(--danger)]'
                      : 'bg-[var(--success)]/15 text-[var(--success)]'
                  }`}
                >
                  {a.accountStatus === 'suspended' ? 'Suspended' : 'Active'}
                </span>
              </td>
              <td data-label="Actions" className="py-3.5 px-5">
                {a.role === 'admin' ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        await withToast(adminModerateUserAction({
                          targetUserId: a.id,
                          accountStatus: a.accountStatus === 'suspended' ? 'verified' : 'suspended',
                        }))
                        router.refresh()
                      })
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold cursor-pointer"
                  >
                    {a.accountStatus === 'suspended' ? 'Reactivate' : 'Deactivate'}
                  </button>
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">Protected Root</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4 safe-bottom">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg">Add New Admin</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-sm font-bold">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin.name@kasafide.ph"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temporary password (8+ chars)"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const res = await superAdminCreateAdminAction({
                    firstName,
                    lastName,
                    email,
                    password,
                  })
                  setFeedback(res.message || res.error || null)
                  if (res.ok) {
                    setModalOpen(false)
                    setFirstName('')
                    setLastName('')
                    setEmail('')
                    setPassword('')
                    router.refresh()
                  }
                })
              }}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer"
            >
              Create Admin Account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
