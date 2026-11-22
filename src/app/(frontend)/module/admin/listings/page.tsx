import { getPayloadClient } from '@/lib/payload'
import { DEMO_PULONG_BUHANGIN_LOT, mapListingDoc } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { AdminListingsClient } from './AdminListingsClient'

export default async function AdminListingsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const res = await payload
    .find({
      collection: 'listings',
      user: rawUser,
      overrideAccess: false,
      depth: 2,
      limit: 100,
      sort: '-createdAt',
    })
    .catch(() => ({ docs: [] }))

  let listings = res.docs.map(mapListingDoc)
  if (listings.length === 0) {
    listings = [DEMO_PULONG_BUHANGIN_LOT]
  }

  return (
    <PortalShell
      user={user}
      activePage="listings"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Listings Management</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Review property ownership documents and publish verified listings to the public catalog.
        </p>
      </div>
      <AdminListingsClient listings={listings} />
    </PortalShell>
  )
}
