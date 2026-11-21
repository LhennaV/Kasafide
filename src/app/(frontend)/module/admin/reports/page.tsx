import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { AdminReportsClient, type ReportRow } from './AdminReportsClient'
import type { Listing, ListingReport, User } from '@/payload-types'

export default async function AdminReportsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'listing-reports',
    user: rawUser,
    overrideAccess: false,
    depth: 1,
    limit: 50,
    sort: '-createdAt',
  })

  const rows: ReportRow[] = res.docs.map((r: ListingReport) => {
    const listing = typeof r.listing === 'object' && r.listing ? (r.listing as Listing) : null
    const reporter = typeof r.reporter === 'object' && r.reporter ? (r.reporter as User) : null
    return {
      id: String(r.id),
      listingTitle: listing?.title || 'Listing',
      reporterName: reporter?.fullName || 'Member',
      reason: r.reason,
      details: r.details,
      status: r.status,
    }
  })

  return (
    <PortalShell
      user={user}
      activePage="reports"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Trust &amp; Safety Reports</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Investigate and resolve community-submitted listing reports.
        </p>
      </div>
      <AdminReportsClient rows={rows} />
    </PortalShell>
  )
}
