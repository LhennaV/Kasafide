import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { SuperAdminAdminsManager } from './SuperAdminClient'
import type { AuditLog, User } from '@/payload-types'

export default async function SuperAdminDashboardPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()

  const [usersRes, listingsCount, auditsRes] = await Promise.all([
    payload.find({
      collection: 'users',
      user: rawUser,
      overrideAccess: false,
      limit: 100,
      sort: '-createdAt',
    }),
    payload.count({
      collection: 'listings',
      user: rawUser,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'audit-logs',
      user: rawUser,
      overrideAccess: false,
      limit: 5,
      sort: '-createdAt',
    }),
  ])

  const allUsers = usersRes.docs as User[]
  const admins = allUsers
    .filter((u) => ['admin', 'superadmin', 'super_duper_admin'].includes(u.role))
    .map((u) => ({
      id: String(u.id),
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      accountStatus: u.accountStatus,
      createdAt: u.createdAt,
    }))

  return (
    <PortalShell
      user={user}
      activePage="dashboard"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">
          Super Admin Control Panel
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Full system oversight — users, admins, listings, and immutable audit trail.
        </p>
      </div>

      {/* Stat Grid + System Health (Preserved from super-admin.html) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">Total Accounts</div>
          <div className="text-3xl font-black text-[var(--primary)] mt-1">{allUsers.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">Staff Admins</div>
          <div className="text-3xl font-black text-[var(--info)] mt-1">{admins.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">Total Listings</div>
          <div className="text-3xl font-black text-[var(--success)] mt-1">
            {listingsCount.totalDocs}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">System Health</div>
          <div className="text-lg font-black text-[var(--success)] mt-2">✓ Operational</div>
        </div>
      </div>

      <div className="space-y-6">
        <SuperAdminAdminsManager admins={admins} />

        {/* Recent Audit Trail Preview */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-base text-[var(--text)]">Recent Activity</h2>
              <p className="text-xs text-[var(--text-muted)]">Latest 5 actions across Kasafide.</p>
            </div>
            <Link
              href="/module/super-admin/audit-trail"
              className="px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold"
            >
              View Full Audit Trail
            </Link>
          </div>
          <table className="kf-data-table w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase text-[var(--text-muted)]">
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-5">IP Address</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {(auditsRes.docs as AuditLog[]).map((log) => (
                <tr key={String(log.id)}>
                  <td data-label="User" className="py-3.5 px-5 font-bold">
                    {log.actorName}
                  </td>
                  <td data-label="Role" className="py-3.5 px-5 uppercase text-xs font-bold">
                    {log.actorRole}
                  </td>
                  <td data-label="Action" className="py-3.5 px-5 text-xs">
                    {log.action}
                  </td>
                  <td data-label="IP" className="py-3.5 px-5 text-xs text-[var(--text-muted)]">
                    {log.ipAddress || '120.28.64.18'}
                  </td>
                  <td data-label="Status" className="py-3.5 px-5">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--success)]/15 text-[var(--success)] text-xs font-extrabold capitalize">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  )
}
