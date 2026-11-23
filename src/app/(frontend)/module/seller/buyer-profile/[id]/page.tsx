import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import type { Listing, User, ViewingRequest } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Kasafide – Buyer Profile',
}

function formatDate(value: string, opts: Intl.DateTimeFormatOptions): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-PH', opts)
}

function statusBadgeClass(status: string): string {
  if (status === 'approved' || status === 'completed')
    return 'bg-[var(--success)]/15 text-[var(--success)]'
  if (status === 'declined' || status === 'cancelled' || status === 'rejected')
    return 'bg-[var(--danger)]/15 text-[var(--danger)]'
  return 'bg-[var(--warning)]/15 text-[var(--warning)]'
}

export default async function BuyerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()

  const buyer = (await payload
    .findByID({ collection: 'users', id, user: rawUser, overrideAccess: false, depth: 0 })
    .catch(() => null)) as User | null
  if (!buyer || buyer.role !== 'buyer') notFound()

  // Only the viewings this buyer booked with the signed-in seller, never anyone else's.
  const viewingsRes = await payload
    .find({
      collection: 'viewing-requests',
      user: rawUser,
      overrideAccess: false,
      where: { and: [{ buyer: { equals: buyer.id } }, { seller: { equals: rawUser.id } }] },
      depth: 1,
      limit: 20,
      sort: '-createdAt',
    })
    .catch(() => ({ docs: [] as ViewingRequest[] }))
  const viewings = viewingsRes.docs as ViewingRequest[]

  const isVerified = buyer.accountStatus === 'verified'
  const savedCount = buyer.savedListings?.length ?? 0
  const initials = `${buyer.firstName?.[0] ?? ''}${buyer.lastName?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <PortalShell
      user={user}
      activePage="viewing-requests"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 mb-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div
          className="w-20 h-20 shrink-0 rounded-full bg-[#FF8A65] text-[#2B1B3D] font-black text-2xl flex items-center justify-center"
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-[var(--text)]">{buyer.fullName}</h1>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                isVerified
                  ? 'bg-[var(--success)]/15 text-[var(--success)]'
                  : 'bg-[var(--warning)]/15 text-[var(--warning)]'
              }`}
            >
              {isVerified ? '✓ Verified Buyer' : 'ID Not Yet Verified'}
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Member since {formatDate(buyer.createdAt, { month: 'long', year: 'numeric' })}
          </p>
          {buyer.bio && (
            <p className="text-sm text-[var(--text)] mt-3 whitespace-pre-line">{buyer.bio}</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 mb-6">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-4">
          About This Buyer
        </h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <div>
            <dt className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
              Account Type
            </dt>
            <dd className="mt-1 text-sm font-bold">Buyer / Renter</dd>
          </div>
          <div>
            <dt className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
              Joined
            </dt>
            <dd className="mt-1 text-sm font-bold">
              {formatDate(buyer.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
              Saved Properties
            </dt>
            <dd className="mt-1 text-sm font-bold">{savedCount}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-4">
          Viewing Requests With You
        </h2>
        {viewings.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            This buyer hasn&apos;t requested a viewing of your properties yet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]/60">
            {viewings.map((v) => {
              const listing =
                typeof v.listing === 'object' && v.listing ? (v.listing as Listing) : null
              return (
                <li
                  key={v.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-sm text-[var(--text)] truncate">
                      {listing?.title || 'Property'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      {v.preferredDate} &middot; {v.preferredTime}
                    </div>
                  </div>
                  <span
                    className={`self-start sm:self-center px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${statusBadgeClass(v.status)}`}
                  >
                    {v.status}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </PortalShell>
  )
}
