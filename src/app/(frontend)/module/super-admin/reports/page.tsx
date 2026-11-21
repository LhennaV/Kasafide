import { getCachedPublicMarketplace, formatPeso } from '@/lib/kasafide-data'
import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import type { Payment } from '@/payload-types'

export default async function SuperAdminReportsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const [marketplace, payRes, auditCount] = await Promise.all([
    getCachedPublicMarketplace(),
    payload.find({
      collection: 'payments',
      user: rawUser,
      overrideAccess: false,
      limit: 100,
    }),
    payload.count({
      collection: 'audit-logs',
      user: rawUser,
      overrideAccess: false,
    }),
  ])

  const grossConfirmed = (payRes.docs as Payment[])
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  return (
    <PortalShell
      user={user}
      activePage="reports"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">System Reports</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Executive compliance, marketplace trust metrics, and financial summary.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">
            Verified Live Listings
          </div>
          <div className="text-3xl font-black text-[var(--primary)] mt-1">
            {marketplace.stats.listingsLive}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">
            Barangay Coverage
          </div>
          <div className="text-3xl font-black text-[var(--success)] mt-1">
            {marketplace.stats.barangaysCovered} / 24
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">
            Confirmed Ledger Volume
          </div>
          <div className="text-2xl font-black text-[var(--info)] mt-1">
            {formatPeso(grossConfirmed)}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">
            Audit Events Logged
          </div>
          <div className="text-3xl font-black text-[var(--text)] mt-1">
            {auditCount.totalDocs}
          </div>
        </div>
      </div>
    </PortalShell>
  )
}
