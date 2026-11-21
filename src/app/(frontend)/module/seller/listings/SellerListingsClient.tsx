'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { sellerUpdateListingAvailabilityAction } from '@/app/actions/kasafide'
import type { ListingCardView } from '@/lib/kasafide-data'

export function SellerListingsClient({ listings }: { listings: ListingCardView[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'all' | 'approved' | 'pending' | 'closed'>('all')

  const shown = listings.filter((l) => (tab === 'all' ? true : l.status === tab))

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(['all', 'approved', 'pending', 'closed'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold capitalize cursor-pointer ${
              tab === t
                ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            {t} ({t === 'all' ? listings.length : listings.filter((x) => x.status === t).length})
          </button>
        ))}
      </div>

      {shown.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {shown.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden flex flex-col sm:flex-row"
            >
              <div className="relative w-full sm:w-44 h-44 sm:h-auto shrink-0 bg-[var(--surface-soft)]">
                <Image
                  src={item.coverUrl}
                  alt={item.coverAlt}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase ${
                        item.status === 'approved'
                          ? 'bg-[var(--success)]/15 text-[var(--success)]'
                          : item.status === 'pending'
                            ? 'bg-[var(--warning)]/15 text-[var(--warning)]'
                            : 'bg-[var(--border)] text-[var(--text-muted)]'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-sm font-black text-[var(--primary)]">
                      {item.priceFormatted}
                      {item.periodLabel}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-[var(--text)] line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Brgy. {item.barangayName} &middot; {item.availableUnits}/{item.totalUnits} units open
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border)]">
                  {item.hasMultipleUnits && item.status !== 'closed' && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        const next = Math.max(0, item.availableUnits - 1)
                        startTransition(async () => {
                          await sellerUpdateListingAvailabilityAction({
                            listingId: item.id,
                            availableUnits: next,
                          })
                          router.refresh()
                        })
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[var(--surface-soft)] text-xs font-bold cursor-pointer"
                    >
                      Mark 1 Unit Occupied
                    </button>
                  )}
                  {item.status !== 'closed' && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          await sellerUpdateListingAvailabilityAction({
                            listingId: item.id,
                            closeListing: true,
                          })
                          router.refresh()
                        })
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[var(--danger)]/40 text-[var(--danger)] text-xs font-bold cursor-pointer"
                    >
                      Close Listing
                    </button>
                  )}
                  <Link
                    href={`/module/buyer/listing/${item.slug}`}
                    className="ml-auto text-xs font-extrabold text-[var(--primary)]"
                  >
                    Preview &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="font-bold text-sm mb-3">No listings in this tab yet.</p>
          <Link
            href="/module/seller/post"
            className="inline-block px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold"
          >
            + Post a Property
          </Link>
        </div>
      )}
    </div>
  )
}
