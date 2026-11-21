import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findBySlug, getPayloadClient } from '@/lib/payload'
import { mapListingDoc } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { ListingDetailClient } from '@/components/kasafide/ListingDetailClient'
import type { Review, User } from '@/payload-types'

export default async function BuyerPortalListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser()
  const doc = await findBySlug('listings', slug, { depth: 2, user: rawUser })
  if (!doc) notFound()

  const payload = await getPayloadClient()
  const reviewsRes = await payload.find({
    collection: 'reviews',
    overrideAccess: false,
    user: rawUser,
    where: { listing: { equals: doc.id } },
    depth: 1,
    limit: 20,
    sort: '-createdAt',
  })

  const reviews = reviewsRes.docs.map((r: Review) => {
    const reviewer = typeof r.reviewer === 'object' && r.reviewer ? (r.reviewer as User) : null
    return {
      id: String(r.id),
      rating: r.rating,
      comment: r.comment,
      reviewerName: reviewer?.fullName || 'Verified Member',
      createdAt: r.createdAt,
    }
  })

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
      <div className="mb-4">
        <Link
          href={user.role === 'seller' ? '/module/seller' : '/module/buyer'}
          className="text-xs font-bold text-[var(--primary)] hover:underline"
        >
          &larr; Back to Marketplace
        </Link>
      </div>
      <ListingDetailClient
        listing={mapListingDoc(doc)}
        reviews={reviews}
        initialSaved={savedIds.includes(String(doc.id))}
        inPortal
      />
    </PortalShell>
  )
}
