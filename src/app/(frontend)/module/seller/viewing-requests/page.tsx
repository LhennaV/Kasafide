import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { ViewingRequestsClient, type ViewingRow } from './ViewingRequestsClient'
import type { Listing, User, ViewingRequest } from '@/payload-types'

export default async function SellerViewingRequestsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const res = await payload
    .find({
      collection: 'viewing-requests',
      user: rawUser,
      overrideAccess: false,
      where: { seller: { equals: rawUser.id } },
      depth: 1,
      limit: 40,
      sort: '-createdAt',
    })
    .catch(() => ({ docs: [] }))

  const rows: ViewingRow[] = res.docs.map((v: ViewingRequest) => {
    const listing = typeof v.listing === 'object' && v.listing ? (v.listing as Listing) : null
    const buyer = typeof v.buyer === 'object' && v.buyer ? (v.buyer as User) : null
    return {
      id: String(v.id),
      listingTitle: listing?.title || 'Property',
      buyerName: buyer?.fullName || 'Verified Buyer',
      buyerId: buyer ? String(buyer.id) : '',
      preferredDate: v.preferredDate,
      preferredTime: v.preferredTime,
      notes: v.notes || '',
      status: v.status,
    }
  })

  return (
    <PortalShell
      user={user}
      activePage="viewing-requests"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Viewing Requests</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Approve or manage in-person property inspections requested by buyers.
        </p>
      </div>
      <ViewingRequestsClient rows={rows} />
    </PortalShell>
  )
}
