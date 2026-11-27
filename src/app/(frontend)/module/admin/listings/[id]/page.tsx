import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { mapListingDoc } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { signedUrl } from '@/lib/storage'
import { PortalShell } from '@/components/kasafide/PortalShell'
import type { Listing, User } from '@/payload-types'
import { AdminListingDetailActions } from './AdminListingDetailClient'

export const metadata: Metadata = {
  title: 'Kasafide – Listing Review',
}

const DOC_LABELS: Record<string, string> = {
  tct: 'Transfer Certificate of Title (TCT)',
  deed_of_sale: 'Deed of Absolute Sale',
  tax_declaration: 'Tax Declaration',
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusBadgeClass(status: string): string {
  if (status === 'approved') return 'bg-[var(--success)]/15 text-[var(--success)]'
  if (status === 'pending' || status === 'draft')
    return 'bg-[var(--warning)]/15 text-[var(--warning)]'
  return 'bg-[var(--danger)]/15 text-[var(--danger)]'
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-bold text-[var(--text)] capitalize break-words">{value}</dd>
    </div>
  )
}

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()

  const doc = (await payload
    .findByID({ collection: 'listings', id, user: rawUser, overrideAccess: false, depth: 2 })
    .catch(() => null)) as Listing | null
  if (!doc) notFound()

  const l = mapListingDoc(doc)
  const seller = typeof doc.seller === 'object' && doc.seller ? (doc.seller as User) : null
  // With seller-uploaded photos the cover is already gallery[0]; don't show it twice.
  const photos =
    l.gallery[0]?.url === l.coverUrl
      ? l.gallery.map((p, i) => (i === 0 ? { ...p, caption: 'Cover photo' } : p))
      : [
          ...(l.coverUrl ? [{ url: l.coverUrl, alt: l.coverAlt, caption: 'Cover photo' }] : []),
          ...l.gallery,
        ]
  const ownershipDocUrl = await signedUrl(doc.ownershipDocPath)

  return (
    <PortalShell
      user={user}
      activePage="listings"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-4">
        <Link
          href="/module/admin/listings"
          className="text-xs font-bold text-[var(--primary)] hover:underline"
        >
          &larr; Back to Listings
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${statusBadgeClass(l.status)}`}
            >
              {l.status}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[var(--surface-soft)] text-[var(--text)]">
              {l.listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">{l.title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {[l.address, l.barangayName, l.city].filter(Boolean).join(', ')} &middot; Submitted{' '}
            {formatDate(doc.createdAt)}
          </p>
        </div>
        <AdminListingDetailActions listingId={String(doc.id)} title={l.title} status={l.status} />
      </div>

      {doc.status === 'rejected' && doc.rejectionReason && (
        <section className="mb-5 rounded-3xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-5">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--danger)] mb-1.5">
            Rejection Reason
          </h2>
          <p className="text-sm text-[var(--text)]">{doc.rejectionReason}</p>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-4">
              Photos ({photos.length})
            </h2>
            {photos.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No photos uploaded.</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p, i) => (
                  <li key={`${p.url}-${i}`}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block relative aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--surface-soft)] border border-[var(--border)]"
                    >
                      <Image
                        src={p.url}
                        alt={p.alt || l.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    </a>
                    {p.caption && (
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
                        {p.caption}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-4">
              Property Details
            </h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <InfoItem
                label="Price"
                value={`${l.priceFormatted}${l.listingType === 'rent' ? ' / month' : ''}`}
              />
              <InfoItem label="Type" value={l.propertyType} />
              <InfoItem label="For" value={l.listingType === 'rent' ? 'Rent' : 'Sale'} />
              <InfoItem label="Bedrooms" value={l.bedrooms} />
              <InfoItem label="Bathrooms" value={l.bathrooms} />
              <InfoItem label="Floor Area" value={l.floorAreaSqm ? `${l.floorAreaSqm} sqm` : '—'} />
              {l.lotAreaSqm > 0 && <InfoItem label="Lot Area" value={`${l.lotAreaSqm} sqm`} />}
              <InfoItem label="Negotiable" value={l.priceNegotiable ? 'Yes' : 'No'} />
              {l.hasMultipleUnits && (
                <InfoItem
                  label="Units"
                  value={`${l.availableUnits} of ${l.totalUnits} available`}
                />
              )}
            </dl>
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-3">
              Description
            </h2>
            <p className="text-sm text-[var(--text)] whitespace-pre-line leading-relaxed">
              {l.description || '—'}
            </p>
          </section>

          {l.amenities.length > 0 && (
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-3">
                Amenities
              </h2>
              <ul className="flex flex-wrap gap-2">
                {l.amenities.map((a) => (
                  <li
                    key={a}
                    className="px-3 py-1.5 rounded-full bg-[var(--surface-soft)] text-xs font-bold"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-5">
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-3">
              Ownership Document
            </h2>
            <p className="text-sm font-extrabold text-[var(--text)]">
              {DOC_LABELS[l.ownershipDocType] ?? l.ownershipDocType ?? '—'}
            </p>
            {ownershipDocUrl ? (
              <a
                href={ownershipDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-3 py-1.5 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-extrabold hover:underline"
              >
                View attached document &rarr;
              </a>
            ) : (
              <p className="text-xs text-[var(--text-muted)] mt-1.5">No document attached.</p>
            )}
            <p
              className={`text-xs font-bold mt-1.5 ${l.titleVerified ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}
            >
              {l.titleVerified ? '✓ Title verified' : 'Title not yet verified'}
            </p>
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-3">
              Seller
            </h2>
            {seller ? (
              <>
                <Link
                  href={`/module/admin/users/${seller.id}`}
                  className="font-extrabold text-[var(--text)] hover:text-[var(--primary)] hover:underline"
                >
                  {seller.fullName}
                </Link>
                <p className="text-xs text-[var(--text-muted)] break-all mt-0.5">{seller.email}</p>
                {seller.phone && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{seller.phone}</p>
                )}
                <p className="text-xs font-bold mt-2 capitalize">
                  Account:{' '}
                  <span
                    className={
                      seller.accountStatus === 'verified'
                        ? 'text-[var(--success)]'
                        : 'text-[var(--warning)]'
                    }
                  >
                    {seller.accountStatus}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">{l.sellerName || 'Unknown seller'}</p>
            )}
          </section>
        </aside>
      </div>
    </PortalShell>
  )
}
