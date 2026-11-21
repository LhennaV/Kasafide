'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { decidePaymentAction } from '@/app/actions/kasafide'
import { formatPeso } from '@/lib/format'

export type PaymentRowView = {
  id: string
  referenceCode: string
  listingTitle: string
  counterpartyName: string
  paymentType: string
  method: string
  amount: number
  periodLabel: string
  status: string
  createdAt: string
}

export function BuyerPaymentsClient({ rows }: { rows: PaymentRowView[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {rows.length > 0 ? (
        <table className="kf-data-table w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              <th className="py-3.5 px-5">Reference</th>
              <th className="py-3.5 px-5">Property</th>
              <th className="py-3.5 px-5">Type / Period</th>
              <th className="py-3.5 px-5">Method</th>
              <th className="py-3.5 px-5">Amount</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {rows.map((r) => (
              <tr key={r.id}>
                <td data-label="Reference" className="py-3.5 px-5 font-extrabold text-[var(--primary)]">
                  {r.referenceCode}
                </td>
                <td data-label="Property" className="py-3.5 px-5 font-semibold text-[var(--text)]">
                  {r.listingTitle}
                </td>
                <td data-label="Period" className="py-3.5 px-5 text-xs text-[var(--text-muted)] capitalize">
                  {r.paymentType.replace('_', ' ')} &middot; {r.periodLabel}
                </td>
                <td data-label="Method" className="py-3.5 px-5 uppercase text-xs font-bold">
                  {r.method}
                </td>
                <td data-label="Amount" className="py-3.5 px-5 font-extrabold">
                  {formatPeso(r.amount)}
                </td>
                <td data-label="Status" className="py-3.5 px-5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold capitalize ${
                      r.status === 'confirmed'
                        ? 'bg-[var(--success)]/15 text-[var(--success)]'
                        : r.status === 'rejected'
                          ? 'bg-[var(--danger)]/15 text-[var(--danger)]'
                          : 'bg-[var(--warning)]/15 text-[var(--warning)]'
                    }`}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
                <td data-label="Action" className="py-3.5 px-5">
                  {r.status === 'confirmed' && r.paymentType === 'security_deposit' ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          await decidePaymentAction({
                            paymentId: r.id,
                            decision: 'refund_requested',
                          })
                          router.refresh()
                        })
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold hover:border-[var(--primary)] cursor-pointer"
                    >
                      Request Refund
                    </button>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">Recorded</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-12 text-center text-sm text-[var(--text-muted)]">
          No payment records yet. Open any property listing to pay via QR Ph, GCash, or Maya.
        </div>
      )}
    </div>
  )
}
