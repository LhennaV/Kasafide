import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findBySlug, getPayloadClient } from '@/lib/payload'
import { DEMO_PULONG_BUHANGIN_LOT, mapListingDoc } from '@/lib/kasafide-data'
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

  const savedIds = (rawUser.savedListings ?? []).map((s) =>
    typeof s === 'object' && s !== null ? String(s.id) : String(s),
  )

  // Fast-track demo lot preview
  if (
    slug === DEMO_PULONG_BUHANGIN_LOT.slug ||
    slug === 'demo-lot-pulong-buhangin' ||
    slug === '99001'
  ) {
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
          listing={DEMO_PULONG_BUHANGIN_LOT}
          reviews={[
            {
              id: 'review-pb-1',
              rating: 5,
              comment:
                'Clean title and boundary markers verified on site. Very peaceful neighborhood near Pulong Buhangin national road.',
              reviewerName: 'Juan Dela Cruz (Verified Buyer)',
              createdAt: '2026-01-20T14:30:00.000Z',
            },
          ]}
          initialSaved={savedIds.includes(String(DEMO_PULONG_BUHANGIN_LOT.id))}
          inPortal
        />
      </PortalShell>
    )
  }

  const doc = await findBySlug('listings', slug, { depth: 2, user: rawUser }).catch(() => null)
  if (!doc) notFound()

  const payload = await getPayloadClient()
  const reviewsRes = await payload
    .find({
      collection: 'reviews',
      overrideAccess: false,
      user: rawUser,
      where: { listing: { equals: doc.id } },
      depth: 1,
      limit: 20,
      sort: '-createdAt',
    })
    .catch(() => ({ docs: [] }))

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
