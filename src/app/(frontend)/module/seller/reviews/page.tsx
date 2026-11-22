import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import type { Listing, Review, User } from '@/payload-types'

export default async function SellerReviewsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const revRes = await payload
    .find({
      collection: 'reviews',
      user: rawUser,
      overrideAccess: false,
      where: { seller: { equals: rawUser.id } },
      depth: 1,
      limit: 30,
      sort: '-createdAt',
    })
    .catch(() => ({ docs: [] }))

  return (
    <PortalShell
      user={user}
      activePage="reviews"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">My Reviews</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Ratings and feedback from verified buyers and tenants.
        </p>
      </div>
      <div className="space-y-3">
        {revRes.docs.map((r: Review) => {
          const reviewer = typeof r.reviewer === 'object' && r.reviewer ? (r.reviewer as User) : null
          const listing = typeof r.listing === 'object' && r.listing ? (r.listing as Listing) : null
          return (
            <div
              key={String(r.id)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm">
                  {reviewer?.fullName || 'Verified Buyer'} &middot;{' '}
                  <span className="text-[var(--primary)]">{listing?.title || 'Property'}</span>
                </span>
                <span className="text-xs font-extrabold text-[#F4BC5C]">
                  {'★'.repeat(r.rating)}
                </span>
              </div>
              <p className="text-sm text-[var(--text-soft)]">{r.comment}</p>
            </div>
          )
        })}
        {revRes.docs.length === 0 && (
          <div className="p-10 rounded-2xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
            No buyer reviews received yet.
          </div>
        )}
      </div>
    </PortalShell>
  )
}
