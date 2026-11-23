import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { mapListingDoc } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { PropertyCard } from '@/components/kasafide/PropertyCard'
import type { Review, User } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Kasafide – Seller Profile',
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating)
  return (
    <span
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={i <= rounded ? 'fill-[var(--warning)]' : 'fill-[var(--border)]'}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}

function formatDate(value: string, opts: Intl.DateTimeFormatOptions): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-PH', opts)
}

export default async function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser()
  const payload = await getPayloadClient()

  const seller = (await payload
    .findByID({ collection: 'users', id, user: rawUser, overrideAccess: false, depth: 0 })
    .catch(() => null)) as User | null
  if (!seller || seller.role !== 'seller') notFound()

  const [listingsRes, reviewsRes] = await Promise.all([
    payload
      .find({
        collection: 'listings',
        user: rawUser,
        overrideAccess: false,
        where: { and: [{ seller: { equals: seller.id } }, { status: { equals: 'approved' } }] },
        depth: 2,
        limit: 24,
        sort: '-createdAt',
      })
      .catch(() => ({ docs: [] })),
    payload
      .find({
        collection: 'reviews',
        user: rawUser,
        overrideAccess: false,
        where: { seller: { equals: seller.id } },
        depth: 1,
        limit: 50,
        sort: '-createdAt',
      })
      .catch(() => ({ docs: [] as Review[] })),
  ])

  const listings = listingsRes.docs.map(mapListingDoc)
  const reviews = reviewsRes.docs as Review[]
  const reviewCount = reviews.length
  const avgRating = reviewCount ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0
  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r) => Math.round(r.rating) === s).length,
  }))
  const savedIds = (rawUser.savedListings ?? []).map((s) =>
    typeof s === 'object' && s !== null ? String(s.id) : String(s),
  )
  const isVerified = seller.accountStatus === 'verified'
  const initials =
    `${seller.firstName?.[0] ?? ''}${seller.lastName?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <PortalShell
      user={user}
      activePage="dashboard"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 mb-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div
          className="w-20 h-20 shrink-0 rounded-full bg-[#5B3A8E] text-[#FBF6F0] font-black text-2xl flex items-center justify-center"
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-[var(--text)]">{seller.fullName}</h1>
            {isVerified && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[var(--success)]/15 text-[var(--success)]">
                ✓ Verified Seller
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Member since {formatDate(seller.createdAt, { month: 'long', year: 'numeric' })} &middot;{' '}
            {listings.length} active listing{listings.length === 1 ? '' : 's'}
            {reviewCount > 0 && (
              <>
                {' '}
                &middot; {avgRating.toFixed(1)} ★ ({reviewCount})
              </>
            )}
          </p>
          {seller.bio && (
            <p className="text-sm text-[var(--text)] mt-3 whitespace-pre-line">{seller.bio}</p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-[var(--text)] mb-4">Active Listings</h2>
        {listings.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--text-muted)]">
            No active listings from this seller.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {listings.map((l) => (
              <PropertyCard
                key={l.id}
                property={l}
                detailHrefPrefix="/module/buyer/listing"
                isSaved={savedIds.includes(l.id)}
                showSaveButton={user.role === 'buyer'}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <h2 className="text-lg font-black text-[var(--text)] mb-4">Reviews</h2>
        {reviewCount === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No reviews yet for this seller.</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-black text-[var(--text)]">{avgRating.toFixed(1)}</div>
                <div>
                  <Stars rating={avgRating} size={18} />
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {reviewCount} review{reviewCount === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
              <ul className="flex-1 space-y-1.5">
                {starCounts.map(({ stars, count }) => (
                  <li key={stars} className="flex items-center gap-2 text-xs font-bold">
                    <span className="w-8 text-[var(--text-muted)]">{stars} ★</span>
                    <span className="flex-1 h-2 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                      <span
                        className="block h-full rounded-full bg-[var(--warning)]"
                        style={{ width: `${Math.round((count / reviewCount) * 100)}%` }}
                      />
                    </span>
                    <span className="w-6 text-right text-[var(--text-muted)]">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="divide-y divide-[var(--border)]/60">
              {reviews.map((r) => {
                const reviewer =
                  typeof r.reviewer === 'object' && r.reviewer ? (r.reviewer as User) : null
                const name = reviewer?.fullName || 'Verified Member'
                return (
                  <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 shrink-0 rounded-full bg-[#FF8A65] text-[#2B1B3D] font-black text-xs flex items-center justify-center"
                        aria-hidden="true"
                      >
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-sm text-[var(--text)] truncate">
                          {name}
                        </div>
                        <Stars rating={r.rating} size={13} />
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {formatDate(r.createdAt, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <p className="text-sm text-[var(--text)] mt-2 whitespace-pre-line">
                      {r.comment}
                    </p>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>
    </PortalShell>
  )
}
