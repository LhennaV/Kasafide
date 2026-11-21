'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminModerateUserAction } from '@/app/actions/kasafide'

export type AdminUserRow = {
  id: string
  fullName: string
  email: string
  role: string
  accountStatus: string
  moaSigned: boolean
}

export function AdminUsersClient({ rows }: { rows: AdminUserRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [roleFilter, setRoleFilter] = useState('')

  const shown = rows.filter((u) => (!roleFilter ? true : u.role === roleFilter))

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          ['', 'All Accounts'],
          ['seller', 'Sellers'],
          ['buyer', 'Buyers'],
        ].map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setRoleFilter(val)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold cursor-pointer ${
              roleFilter === val
                ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="kf-data-table w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase text-[var(--text-muted)]">
              <th className="py-3.5 px-5">User</th>
              <th className="py-3.5 px-5">Email</th>
              <th className="py-3.5 px-5">Role</th>
              <th className="py-3.5 px-5">Verification</th>
              <th className="py-3.5 px-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {shown.map((u) => (
              <tr key={u.id}>
                <td data-label="User" className="py-3.5 px-5 font-extrabold">
                  {u.fullName}
                </td>
                <td data-label="Email" className="py-3.5 px-5 text-xs text-[var(--text-muted)]">
                  {u.email}
                </td>
                <td data-label="Role" className="py-3.5 px-5 capitalize text-xs font-bold">
                  {u.role}
                </td>
                <td data-label="Status" className="py-3.5 px-5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                      u.accountStatus === 'verified'
                        ? 'bg-[var(--success)]/15 text-[var(--success)]'
                        : u.accountStatus === 'suspended'
                          ? 'bg-[var(--danger)]/15 text-[var(--danger)]'
                          : 'bg-[var(--warning)]/15 text-[var(--warning)]'
                    }`}
                  >
                    {u.accountStatus}
                  </span>
                </td>
                <td data-label="Actions" className="py-3.5 px-5">
                  <div className="flex flex-wrap gap-1.5 justify-end md:justify-start">
                    {u.accountStatus !== 'verified' && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await adminModerateUserAction({
                              targetUserId: u.id,
                              accountStatus: 'verified',
                            })
                            router.refresh()
                          })
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[var(--success)]/20 text-[var(--success)] text-xs font-extrabold cursor-pointer"
                      >
                        Verify ID
                      </button>
                    )}
                    {u.accountStatus !== 'suspended' &&
                      !['admin', 'superadmin', 'super_duper_admin'].includes(u.role) && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await adminModerateUserAction({
                                targetUserId: u.id,
                                accountStatus: 'suspended',
                              })
                              router.refresh()
                            })
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[var(--danger)]/15 text-[var(--danger)] text-xs font-bold cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
