import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { mapListingDoc } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { PropertyCard } from '@/components/kasafide/PropertyCard'

export default async function BuyerSavedPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser()
  const savedIds = (rawUser.savedListings ?? []).map((s) =>
    typeof s === 'object' && s !== null ? String(s.id) : String(s),
  )

  const payload = await getPayloadClient()
  const savedRes = savedIds.length
    ? await payload
        .find({
          collection: 'listings',
          user: rawUser,
          overrideAccess: false,
          where: { id: { in: savedIds } },
          depth: 2,
          limit: 50,
        })
        .catch(() => ({ docs: [] }))
    : { docs: [] }

  const cards = savedRes.docs.map(mapListingDoc)

  return (
    <PortalShell
      user={user}
      activePage="saved"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Saved Listings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Your shortlisted Sta. Maria properties ({cards.length} saved)
        </p>
      </div>

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((item) => (
            <PropertyCard
              key={item.id}
              property={item}
              detailHrefPrefix="/module/buyer/listing"
              showSaveButton
              isSaved
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <h2 className="font-extrabold text-base mb-2">No saved properties yet</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Tap the heart icon on any listing card to keep track of homes you like.
          </p>
          <Link
            href="/module/buyer"
            className="inline-block px-6 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm"
          >
            Explore Properties
          </Link>
        </div>
      )}
    </PortalShell>
  )
}
