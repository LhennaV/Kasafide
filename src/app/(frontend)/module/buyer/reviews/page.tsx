import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import type { Listing, Review } from '@/payload-types'

export default async function BuyerReviewsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser()
  const payload = await getPayloadClient()
  const revRes = await payload.find({
    collection: 'reviews',
    user: rawUser,
    overrideAccess: false,
    where: { reviewer: { equals: rawUser.id } },
    depth: 1,
    limit: 30,
    sort: '-createdAt',
  })

  return (
    <PortalShell
      user={user}
      activePage="reviews"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Reviews &amp; Feedback</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Reviews you have shared on verified properties in Sta. Maria.
        </p>
      </div>
      <div className="space-y-3">
        {revRes.docs.map((r: Review) => {
          const listing = typeof r.listing === 'object' && r.listing ? (r.listing as Listing) : null
          return (
            <div
              key={String(r.id)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-sm text-[var(--text)]">
                  {listing?.title || 'Verified Property'}
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
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--text-muted)]">
            You have not submitted any reviews yet.
          </div>
        )}
      </div>
    </PortalShell>
  )
}
