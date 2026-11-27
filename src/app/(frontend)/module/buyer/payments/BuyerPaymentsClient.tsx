'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { decidePaymentAction } from '@/app/actions/kasafide'
import { formatPeso } from '@/lib/format'
import { withToast } from '@/lib/toast'

export type PaymentRowView = {
  id: string
  referenceCode: string
  listingTitle: string
  counterpartyName: string
  paymentType: string
  method: string
  methodLabel?: string
  amount: number
  periodLabel: string
  status: string
  createdAt: string
  payerReference?: string
  /** Short-lived link to the receipt screenshot, when one was attached. */
  proofUrl?: string | null
}

/** A seller's payment request in Messages that this buyer has not paid yet. */
export type OpenRequestView = {
  messageId: string
  sellerId: string
  sellerName: string
  listingTitle: string
  amount: number
  paymentType: string
  periodLabel: string
  createdAt: string
  rejectedBefore: boolean
}

export const METHOD_LABEL: Record<string, string> = {
  qrph: 'QR Ph',
  gcash: 'GCash',
  maya: 'Maya',
  ewallet: 'E-Wallet',
  bank_transfer: 'Bank Transfer',
}
export const TYPE_LABEL: Record<string, string> = {
  rent: 'Monthly Rent',
  reservation: 'Reservation Fee',
  security_deposit: 'Security Deposit',
  purchase: 'Property Purchase',
}
export const STATUS_LABEL: Record<string, string> = {
  pending_verification: 'Waiting for seller',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  refund_requested: 'Refund requested',
  refunded: 'Refunded',
}

export function StatusPill({ status }: { status: string }) {
  const cls =
    status === 'confirmed'
      ? 'bg-[var(--success)]/15 text-[var(--success)]'
      : status === 'rejected'
        ? 'bg-[var(--danger)]/15 text-[var(--danger)]'
        : status === 'refunded'
          ? 'bg-[var(--surface-soft)] text-[var(--text-muted)]'
          : 'bg-[var(--warning)]/15 text-[var(--warning)]'
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap ${cls}`}>
      {STATUS_LABEL[status] || status.replace('_', ' ')}
    </span>
  )
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ id: T; label: string; count: number }>
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div data-tour="payment-tabs" className="flex gap-1.5 p-1 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] w-fit max-w-full overflow-x-auto mb-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          data-tour={`tab-${t.id}`}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer transition ${
            value === t.id ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          {t.label}
          <span className="ml-1.5 opacity-75">{t.count}</span>
        </button>
      ))}
    </div>
  )
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function BuyerPaymentsClient({
  rows,
  openRequests,
}: {
  rows: PaymentRowView[]
  openRequests: OpenRequestView[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const inProgress = rows.filter((r) => r.status === 'pending_verification' || r.status === 'refund_requested')
  const history = rows.filter((r) => !inProgress.includes(r))
  const [tab, setTab] = useState<'topay' | 'progress' | 'history'>(
    openRequests.length > 0 ? 'topay' : inProgress.length > 0 ? 'progress' : 'history',
  )

  return (
    <>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'topay', label: 'To Pay', count: openRequests.length },
          { id: 'progress', label: 'Waiting for Seller', count: inProgress.length },
          { id: 'history', label: 'Purchase History', count: history.length },
        ]}
      />

      {tab === 'topay' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {openRequests.length === 0 ? (
            <EmptyCard text="Nothing to pay. When a seller sends you a payment request in Messages, it shows up here too." />
          ) : (
            openRequests.map((r) => (
              <div key={r.messageId} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--primary)]">
                      {TYPE_LABEL[r.paymentType] || r.paymentType}
                    </div>
                    <div className="text-2xl font-black text-[var(--text)]">{formatPeso(r.amount)}</div>
                  </div>
                  {r.rejectedBefore && <StatusPill status="rejected" />}
                </div>
                <div className="text-sm font-semibold text-[var(--text)] truncate">{r.listingTitle}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  From {r.sellerName}
                  {r.periodLabel ? ` · ${r.periodLabel}` : ''} · {fmtDate(r.createdAt)}
                </div>
                <Link
                  href={`/module/buyer/messages?thread=${encodeURIComponent(r.sellerId)}`}
                  className="block w-full text-center py-2.5 rounded-xl bg-[#FF8A65] text-[#2B1B3D] font-black text-sm"
                >
                  Pay now in Messages
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {tab !== 'topay' && (
        <PaymentsTable
          rows={tab === 'progress' ? inProgress : history}
          counterpartyLabel="Seller"
          empty={
            tab === 'progress'
              ? 'No payments waiting for a seller right now.'
              : 'No finished payments yet. Confirmed, rejected and refunded payments are kept here.'
          }
          action={(r) =>
            r.status === 'confirmed' && r.paymentType === 'security_deposit' ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await withToast(decidePaymentAction({ paymentId: r.id, decision: 'refund_requested' }))
                    router.refresh()
                  })
                }
                className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold hover:border-[var(--primary)] cursor-pointer"
              >
                Request Refund
              </button>
            ) : null
          }
        />
      )}
    </>
  )
}

export function EmptyCard({ text }: { text: string }) {
  return (
    <div className="col-span-full rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center text-sm text-[var(--text-muted)]">
      {text}
    </div>
  )
}

export function PaymentsTable({
  rows,
  counterpartyLabel,
  empty,
  action,
}: {
  rows: PaymentRowView[]
  counterpartyLabel: string
  empty: string
  action?: (r: PaymentRowView) => React.ReactNode
}) {
  if (rows.length === 0) return <EmptyCard text={empty} />
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <table className="kf-data-table w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
            <th className="py-3.5 px-5">Date</th>
            <th className="py-3.5 px-5">Property</th>
            <th className="py-3.5 px-5">{counterpartyLabel}</th>
            <th className="py-3.5 px-5">For</th>
            <th className="py-3.5 px-5">Method / Ref</th>
            <th className="py-3.5 px-5">Amount</th>
            <th className="py-3.5 px-5">Status</th>
            {action && <th className="py-3.5 px-5">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]/50">
          {rows.map((r) => (
            <tr key={r.id}>
              <td data-label="Date" className="py-3.5 px-5 text-xs text-[var(--text-muted)] whitespace-nowrap">
                {fmtDate(r.createdAt)}
                <div className="font-extrabold text-[var(--primary)]">{r.referenceCode}</div>
              </td>
              <td data-label="Property" className="py-3.5 px-5 font-semibold text-[var(--text)]">
                {r.listingTitle}
              </td>
              <td data-label={counterpartyLabel} className="py-3.5 px-5 text-xs">
                {r.counterpartyName}
              </td>
              <td data-label="For" className="py-3.5 px-5 text-xs text-[var(--text-muted)]">
                {TYPE_LABEL[r.paymentType] || r.paymentType} &middot; {r.periodLabel}
              </td>
              <td data-label="Method" className="py-3.5 px-5 text-xs">
                <div className="font-bold">{r.method === 'bank_transfer' && r.methodLabel ? `Bank · ${r.methodLabel}` : r.methodLabel || METHOD_LABEL[r.method] || r.method}</div>
                {r.payerReference && <div className="text-[var(--text-muted)]">Ref {r.payerReference}</div>}
                {r.proofUrl && (
                  <a href={r.proofUrl} target="_blank" rel="noreferrer" className="text-[var(--primary)] font-bold underline">
                    View receipt
                  </a>
                )}
              </td>
              <td data-label="Amount" className="py-3.5 px-5 font-extrabold whitespace-nowrap">
                {formatPeso(r.amount)}
              </td>
              <td data-label="Status" className="py-3.5 px-5">
                <StatusPill status={r.status} />
              </td>
              {action && (
                <td data-label="Action" className="py-3.5 px-5">
                  {action(r) ?? <span className="text-xs text-[var(--text-muted)]">—</span>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
