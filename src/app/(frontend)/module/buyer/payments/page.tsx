import { getPayloadClient } from '@/lib/payload'
import { formatPeso } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { signedUrl } from '@/lib/storage'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { BuyerPaymentsClient, type OpenRequestView, type PaymentRowView } from './BuyerPaymentsClient'
import type { Listing, Message, Payment, User } from '@/payload-types'

const idOf = (v: unknown) => String(typeof v === 'object' && v !== null ? (v as { id: unknown }).id : v)

export default async function BuyerPaymentsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser()
  const payload = await getPayloadClient()

  const [payRes, reqRes] = await Promise.all([
    payload
      .find({
        collection: 'payments',
        user: rawUser,
        overrideAccess: false,
        where: { payer: { equals: rawUser.id } },
        depth: 1,
        limit: 200,
        sort: '-createdAt',
      })
      .catch(() => ({ docs: [] as Payment[] })),
    payload
      .find({
        collection: 'messages',
        user: rawUser,
        overrideAccess: false,
        where: {
          and: [{ recipient: { equals: rawUser.id } }, { messageType: { equals: 'payment_request' } }],
        },
        depth: 1,
        limit: 100,
        sort: '-createdAt',
      })
      .catch(() => ({ docs: [] as Message[] })),
  ])

  const payments = payRes.docs as Payment[]
  const rows: PaymentRowView[] = await Promise.all(
    payments.map(async (p) => {
      const listing = typeof p.listing === 'object' && p.listing ? (p.listing as Listing) : null
      const payee = typeof p.payee === 'object' && p.payee ? (p.payee as User) : null
      return {
        id: String(p.id),
        referenceCode: p.referenceCode,
        listingTitle: listing?.title || 'Verified Property',
        counterpartyName: payee?.fullName || 'Verified Seller',
        paymentType: p.paymentType,
        method: p.method,
        methodLabel: p.methodLabel || '',
        amount: Number(p.amount) || 0,
        periodLabel: p.periodLabel || 'Current',
        status: p.status,
        createdAt: p.createdAt,
        payerReference: p.payerReference || '',
        proofUrl: p.proofPath ? await signedUrl(p.proofPath) : null,
      }
    }),
  )

  // A request is still "to pay" until a payment against it is pending, confirmed or refunded.
  // payments are newest-first, so walking them in reverse leaves the newest status per request.
  const latestStatusByRequest = new Map<string, string>()
  for (const p of [...payments].reverse()) {
    if (p.requestMessage) latestStatusByRequest.set(idOf(p.requestMessage), p.status)
  }
  const openRequests: OpenRequestView[] = (reqRes.docs as Message[])
    .filter((m) => {
      const s = latestStatusByRequest.get(String(m.id))
      return !s || s === 'rejected'
    })
    .map((m) => {
      const seller = typeof m.sender === 'object' && m.sender ? (m.sender as User) : null
      const listing = typeof m.listing === 'object' && m.listing ? (m.listing as Listing) : null
      return {
        messageId: String(m.id),
        sellerId: idOf(m.sender),
        sellerName: seller?.fullName || 'Seller',
        listingTitle: listing?.title || 'Property',
        amount: Number(m.requestedAmount) || 0,
        paymentType: m.requestedPaymentType || 'rent',
        periodLabel: m.requestedPeriodLabel || '',
        createdAt: m.createdAt,
        rejectedBefore: latestStatusByRequest.get(String(m.id)) === 'rejected',
      }
    })

  const confirmedTotal = rows.filter((r) => r.status === 'confirmed').reduce((sum, r) => sum + r.amount, 0)

  return (
    <PortalShell user={user} activePage="payments" notifications={notifications} unreadMessageCount={unreadMessageCount}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">My Payments</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Pay a seller&apos;s request, follow its confirmation, and see your full purchase history.
          </p>
        </div>
        <div className="px-5 py-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Total Confirmed Paid</div>
          <div className="text-xl font-black text-[var(--primary)]">{formatPeso(confirmedTotal)}</div>
        </div>
      </div>
      <BuyerPaymentsClient rows={rows} openRequests={openRequests} />
    </PortalShell>
  )
}
