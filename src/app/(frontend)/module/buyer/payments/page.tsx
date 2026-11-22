import { getPayloadClient } from '@/lib/payload'
import { formatPeso } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { BuyerPaymentsClient, type PaymentRowView } from './BuyerPaymentsClient'
import type { Listing, Payment, User } from '@/payload-types'

export default async function BuyerPaymentsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser()
  const payload = await getPayloadClient()

  const payRes = await payload
    .find({
      collection: 'payments',
      user: rawUser,
      overrideAccess: false,
      where: { payer: { equals: rawUser.id } },
      depth: 1,
      limit: 50,
      sort: '-createdAt',
    })
    .catch(() => ({ docs: [] }))

  const rows: PaymentRowView[] = payRes.docs.map((p: Payment) => {
    const listing = typeof p.listing === 'object' && p.listing ? (p.listing as Listing) : null
    const payee = typeof p.payee === 'object' && p.payee ? (p.payee as User) : null
    return {
      id: String(p.id),
      referenceCode: p.referenceCode,
      listingTitle: listing?.title || 'Verified Property',
      counterpartyName: payee?.fullName || 'Verified Seller',
      paymentType: p.paymentType,
      method: p.method,
      amount: Number(p.amount) || 0,
      periodLabel: p.periodLabel || 'Current',
      status: p.status,
      createdAt: p.createdAt,
    }
  })

  const confirmedTotal = rows
    .filter((r) => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.amount, 0)

  return (
    <PortalShell
      user={user}
      activePage="payments"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">My Payments</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Track monthly rent, reservation holds, and refundable security deposits.
          </p>
        </div>
        <div className="px-5 py-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">
            Total Confirmed Paid
          </div>
          <div className="text-xl font-black text-[var(--primary)]">
            {formatPeso(confirmedTotal)}
          </div>
        </div>
      </div>
      <BuyerPaymentsClient rows={rows} />
    </PortalShell>
  )
}
