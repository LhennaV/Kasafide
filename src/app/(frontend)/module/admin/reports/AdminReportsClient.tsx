'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminResolveReportAction } from '@/app/actions/kasafide'

export type ReportRow = {
  id: string
  listingTitle: string
  reporterName: string
  reason: string
  details: string
  status: string
}

export function AdminReportsClient({ rows }: { rows: ReportRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {rows.length > 0 ? (
        <table className="kf-data-table w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase text-[var(--text-muted)]">
              <th className="py-3.5 px-5">Listing</th>
              <th className="py-3.5 px-5">Reporter</th>
              <th className="py-3.5 px-5">Reason</th>
              <th className="py-3.5 px-5">Details</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {rows.map((r) => (
              <tr key={r.id}>
                <td data-label="Listing" className="py-3.5 px-5 font-bold">
                  {r.listingTitle}
                </td>
                <td data-label="Reporter" className="py-3.5 px-5 text-xs">
                  {r.reporterName}
                </td>
                <td data-label="Reason" className="py-3.5 px-5 capitalize text-xs font-bold text-[var(--warning)]">
                  {r.reason.replace('_', ' ')}
                </td>
                <td data-label="Details" className="py-3.5 px-5 text-xs text-[var(--text-soft)] max-w-xs">
                  {r.details}
                </td>
                <td data-label="Status" className="py-3.5 px-5">
                  <span className="px-2.5 py-1 rounded-full bg-[var(--surface-soft)] text-xs font-extrabold capitalize">
                    {r.status}
                  </span>
                </td>
                <td data-label="Actions" className="py-3.5 px-5">
                  <div className="flex gap-1.5 justify-end md:justify-start">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          await adminResolveReportAction({
                            reportId: r.id,
                            status: 'resolved',
                            resolutionNotes: 'Reviewed and resolved by Kasafide Moderator.',
                          })
                          router.refresh()
                        })
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[var(--success)]/20 text-[var(--success)] text-xs font-extrabold cursor-pointer"
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          await adminResolveReportAction({
                            reportId: r.id,
                            status: 'dismissed',
                          })
                          router.refresh()
                        })
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-12 text-center text-sm text-[var(--text-muted)]">
          No listing reports in queue.
        </div>
      )}
    </div>
  )
}
