import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import type { AuditLog } from '@/payload-types'

export default async function SuperAdminAuditTrailPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const res = await payload
    .find({
      collection: 'audit-logs',
      user: rawUser,
      overrideAccess: false,
      limit: 100,
      sort: '-createdAt',
    })
    .catch(() => ({ docs: [] }))


  const auditDocs = res.docs as AuditLog[]

  return (
    <PortalShell
      user={user}
      activePage="audit-trail"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">System Audit Trail</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Chronological security and moderation log across all roles on Kasafide.
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="kf-data-table w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase text-[var(--text-muted)]">
              <th className="py-3.5 px-5">Timestamp</th>
              <th className="py-3.5 px-5">Actor</th>
              <th className="py-3.5 px-5">Role</th>
              <th className="py-3.5 px-5">Action</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {auditDocs.map((log) => (
              <tr key={String(log.id)}>
                <td data-label="Timestamp" className="py-3.5 px-5 text-xs text-[var(--text-muted)]">
                  {new Date(log.createdAt).toLocaleString('en-PH')}
                </td>
                <td data-label="Actor" className="py-3.5 px-5 font-bold">
                  {log.actorName}
                </td>
                <td data-label="Role" className="py-3.5 px-5 uppercase text-xs font-bold">
                  {log.actorRole}
                </td>
                <td data-label="Action" className="py-3.5 px-5 font-semibold text-xs">
                  {log.action}
                </td>
                <td data-label="Status" className="py-3.5 px-5">
                  <span className="px-2.5 py-1 rounded-full bg-[var(--success)]/15 text-[var(--success)] text-xs font-extrabold capitalize">
                    {log.status}
                  </span>
                </td>
                <td data-label="Details" className="py-3.5 px-5 text-xs text-[var(--text-soft)]">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  )
}
