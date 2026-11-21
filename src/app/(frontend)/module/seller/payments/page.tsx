import { getPayloadClient } from '@/lib/payload'
import { formatPeso } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { SellerPaymentsClient } from './SellerPaymentsClient'
import type { PaymentRowView } from '../../buyer/payments/BuyerPaymentsClient'
import type { Listing, Payment, User } from '@/payload-types'

export default async function SellerPaymentsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const payRes = await payload.find({
    collection: 'payments',
    user: rawUser,
    overrideAccess: false,
    where: { payee: { equals: rawUser.id } },
    depth: 1,
    limit: 50,
    sort: '-createdAt',
  })

  const rows: PaymentRowView[] = payRes.docs.map((p: Payment) => {
    const listing = typeof p.listing === 'object' && p.listing ? (p.listing as Listing) : null
    const payer = typeof p.payer === 'object' && p.payer ? (p.payer as User) : null
    return {
      id: String(p.id),
      referenceCode: p.referenceCode,
      listingTitle: listing?.title || 'Property',
      counterpartyName: payer?.fullName || 'Verified Buyer',
      paymentType: p.paymentType,
      method: p.method,
      amount: Number(p.amount) || 0,
      periodLabel: p.periodLabel || 'Current',
      status: p.status,
      createdAt: p.createdAt,
    }
  })

  const confirmedRevenue = rows
    .filter((r) => r.status === 'confirmed')
    .reduce((s, r) => s + r.amount, 0)

  return (
    <PortalShell
      user={user}
      activePage="payments"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Payment Management</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Confirm buyer GCash/Maya proofs and monitor QR Ph collections.
          </p>
        </div>
        <div className="px-5 py-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">
            Confirmed Collections
          </div>
          <div className="text-xl font-black text-[var(--success)]">
            {formatPeso(confirmedRevenue)}
          </div>
        </div>
      </div>
      <SellerPaymentsClient rows={rows} />
    </PortalShell>
  )
}
