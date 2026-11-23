'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { adminModerateListingAction } from '@/app/actions/kasafide'
import type { ListingCardView } from '@/lib/kasafide-data'
import { withToast } from '@/lib/toast'

export function AdminListingsClient({ listings }: { listings: ListingCardView[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState('')

  const shown = listings.filter((l) => (!statusFilter ? true : l.status === statusFilter))

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          ['', 'All'],
          ['pending', 'Pending Review'],
          ['approved', 'Approved Live'],
          ['rejected', 'Rejected'],
          ['closed', 'Closed'],
        ].map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setStatusFilter(val)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold cursor-pointer ${
              statusFilter === val
                ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="kf-data-table w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase text-[var(--text-muted)]">
              <th className="py-3.5 px-5">Property</th>
              <th className="py-3.5 px-5">Seller</th>
              <th className="py-3.5 px-5">Barangay / Price</th>
              <th className="py-3.5 px-5">Doc</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {shown.map((l) => (
              <tr key={l.id}>
                <td data-label="Property" className="py-3.5 px-5 font-extrabold">
                  <Link
                    href={`/module/admin/listings/${l.id}`}
                    className="text-[var(--text)] hover:text-[var(--primary)] hover:underline"
                  >
                    {l.title}
                  </Link>
                </td>
                <td data-label="Seller" className="py-3.5 px-5 text-xs">
                  {l.sellerName}
                </td>
                <td data-label="Barangay / Price" className="py-3.5 px-5 text-xs font-bold">
                  {l.barangayName} &middot; {l.priceFormatted}
                </td>
                <td data-label="Doc" className="py-3.5 px-5 uppercase text-xs font-bold">
                  {l.ownershipDocType}
                </td>
                <td data-label="Status" className="py-3.5 px-5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                      l.status === 'approved'
                        ? 'bg-[var(--success)]/15 text-[var(--success)]'
                        : l.status === 'pending'
                          ? 'bg-[var(--warning)]/15 text-[var(--warning)]'
                          : 'bg-[var(--danger)]/15 text-[var(--danger)]'
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
                <td data-label="Moderation" className="py-3.5 px-5">
                  <div className="flex flex-wrap gap-1.5 justify-end md:justify-start">
                    {l.status !== 'approved' && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await withToast(adminModerateListingAction({
                              listingId: l.id,
                              status: 'approved',
                              titleVerified: true,
                            }))
                            router.refresh()
                          })
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[var(--success)]/20 text-[var(--success)] text-xs font-extrabold cursor-pointer"
                      >
                        Approve &amp; Verify TCT
                      </button>
                    )}
                    {/* Rejecting goes through the detail page so the seller always gets a specific reason. */}
                    <Link
                      href={`/module/admin/listings/${l.id}`}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] text-xs font-bold"
                    >
                      {l.status === 'pending' ? 'Review' : 'Details'}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
