import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { mapListingDoc } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { SellerListingsClient } from './SellerListingsClient'

export default async function SellerListingsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
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
      where: { seller: { equals: rawUser.id } },
      depth: 2,
      limit: 50,
      sort: '-createdAt',
    })
    .catch(() => ({ docs: [] }))

  const listings = res.docs.map(mapListingDoc)

  return (
    <PortalShell
      user={user}
      activePage="listings"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">My Listings</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Track approval status, unit availability, and active property posts.
          </p>
        </div>
        <Link
          href="/module/seller/post"
          className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold"
        >
          + Post New Property
        </Link>
      </div>
      <SellerListingsClient listings={listings} />
    </PortalShell>
  )
}
