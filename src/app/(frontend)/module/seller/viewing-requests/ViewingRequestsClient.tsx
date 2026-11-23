'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateViewingStatusAction } from '@/app/actions/kasafide'

export type ViewingRow = {
  id: string
  listingTitle: string
  buyerName: string
  buyerId: string
  preferredDate: string
  preferredTime: string
  notes: string
  status: string
}

export function ViewingRequestsClient({ rows }: { rows: ViewingRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {rows.length > 0 ? (
        <table className="kf-data-table w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase text-[var(--text-muted)]">
              <th className="py-3.5 px-5">Property</th>
              <th className="py-3.5 px-5">Buyer / Renter</th>
              <th className="py-3.5 px-5">Schedule</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {rows.map((r) => (
              <tr key={r.id}>
                <td data-label="Property" className="py-3.5 px-5 font-bold">
                  {r.listingTitle}
                </td>
                <td data-label="Buyer" className="py-3.5 px-5">
                  {r.buyerId ? (
                    <Link
                      href={`/module/seller/buyer-profile/${r.buyerId}`}
                      className="font-bold text-[var(--text)] hover:text-[var(--primary)] hover:underline"
                    >
                      {r.buyerName}
                    </Link>
                  ) : (
                    r.buyerName
                  )}
                </td>
                <td data-label="Schedule" className="py-3.5 px-5 text-xs font-semibold">
                  {r.preferredDate} &middot; {r.preferredTime}
                </td>
                <td data-label="Status" className="py-3.5 px-5">
                  <span className="px-2.5 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-extrabold capitalize">
                    {r.status}
                  </span>
                </td>
                <td data-label="Actions" className="py-3.5 px-5">
                  <div className="flex items-center gap-2 justify-end md:justify-start">
                    {r.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await updateViewingStatusAction({
                                viewingId: r.id,
                                status: 'accepted',
                              })
                              router.refresh()
                            })
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[var(--success)]/20 text-[var(--success)] text-xs font-extrabold cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await updateViewingStatusAction({
                                viewingId: r.id,
                                status: 'declined',
                              })
                              router.refresh()
                            })
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[var(--danger)]/15 text-[var(--danger)] text-xs font-bold cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {r.status === 'accepted' && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await updateViewingStatusAction({
                              viewingId: r.id,
                              status: 'completed',
                            })
                            router.refresh()
                          })
                        }}
                        className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold cursor-pointer"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-12 text-center text-sm text-[var(--text-muted)]">
          No viewing requests yet.
        </div>
      )}
    </div>
  )
}
