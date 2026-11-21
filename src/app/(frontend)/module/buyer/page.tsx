import { getCachedPublicMarketplace } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { BrowseCatalogClient } from '@/components/kasafide/BrowseCatalogClient'

export default async function BuyerDashboardPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'buyer',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const { listings, barangays } = await getCachedPublicMarketplace()

  const savedIds = (rawUser.savedListings ?? []).map((s) =>
    typeof s === 'object' && s !== null ? String(s.id) : String(s),
  )

  return (
    <PortalShell
      user={user}
      activePage="dashboard"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Explore Properties</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Welcome back, {user.firstName}. Every property below is verified by a Kasafide administrator.
        </p>
      </div>
      <BrowseCatalogClient
        listings={listings}
        barangays={barangays}
        detailHrefPrefix="/module/buyer/listing"
        savedIds={savedIds}
      />
    </PortalShell>
  )
}
