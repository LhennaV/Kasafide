'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { decidePaymentAction } from '@/app/actions/kasafide'
import { formatPeso } from '@/lib/format'
import type { PaymentRowView } from '../../buyer/payments/BuyerPaymentsClient'

export function SellerPaymentsClient({ rows }: { rows: PaymentRowView[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {rows.length > 0 ? (
        <table className="kf-data-table w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase text-[var(--text-muted)]">
              <th className="py-3.5 px-5">Reference</th>
              <th className="py-3.5 px-5">Buyer / Tenant</th>
              <th className="py-3.5 px-5">Property</th>
              <th className="py-3.5 px-5">Method</th>
              <th className="py-3.5 px-5">Amount</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Confirm / Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {rows.map((r) => (
              <tr key={r.id}>
                <td data-label="Reference" className="py-3.5 px-5 font-extrabold text-[var(--primary)]">
                  {r.referenceCode}
                </td>
                <td data-label="Buyer" className="py-3.5 px-5 font-semibold">
                  {r.counterpartyName}
                </td>
                <td data-label="Property" className="py-3.5 px-5 text-xs">
                  {r.listingTitle}
                </td>
                <td data-label="Method" className="py-3.5 px-5 uppercase text-xs font-bold">
                  {r.method}
                </td>
                <td data-label="Amount" className="py-3.5 px-5 font-black">
                  {formatPeso(r.amount)}
                </td>
                <td data-label="Status" className="py-3.5 px-5">
                  <span className="px-2.5 py-1 rounded-full bg-[var(--surface-soft)] text-xs font-extrabold capitalize">
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
                <td data-label="Action" className="py-3.5 px-5">
                  <div className="flex items-center gap-2 justify-end md:justify-start">
                    {r.status === 'pending_verification' && (
                      <>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await decidePaymentAction({
                                paymentId: r.id,
                                decision: 'confirmed',
                              })
                              router.refresh()
                            })
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[var(--success)]/20 text-[var(--success)] text-xs font-extrabold cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await decidePaymentAction({
                                paymentId: r.id,
                                decision: 'rejected',
                              })
                              router.refresh()
                            })
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[var(--danger)]/15 text-[var(--danger)] text-xs font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {r.status === 'refund_requested' && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await decidePaymentAction({
                              paymentId: r.id,
                              decision: 'refunded',
                            })
                            router.refresh()
                          })
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold cursor-pointer"
                      >
                        Disburse Refund
                      </button>
                    )}
                    {r.status === 'confirmed' && (
                      <span className="text-xs text-[var(--success)] font-bold">✓ Verified</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-12 text-center text-sm text-[var(--text-muted)]">
          No incoming payments yet.
        </div>
      )}
    </div>
  )
}
