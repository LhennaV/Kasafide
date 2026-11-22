import { getPayloadClient } from '@/lib/payload'
import { formatPeso } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import type { Listing, Payment, User } from '@/payload-types'

export default async function AdminPaymentsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const res = await payload
    .find({
      collection: 'payments',
      user: rawUser,
      overrideAccess: false,
      depth: 1,
      limit: 100,
      sort: '-createdAt',
    })
    .catch(() => ({ docs: [] }))

  return (
    <PortalShell
      user={user}
      activePage="payments"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Payments Overview</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Platform-wide QR Ph, GCash, and Maya transactions across Sta. Maria listings.
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="kf-data-table w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase text-[var(--text-muted)]">
              <th className="py-3.5 px-5">Reference</th>
              <th className="py-3.5 px-5">Buyer</th>
              <th className="py-3.5 px-5">Seller</th>
              <th className="py-3.5 px-5">Property</th>
              <th className="py-3.5 px-5">Method</th>
              <th className="py-3.5 px-5">Amount</th>
              <th className="py-3.5 px-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {res.docs.map((p: Payment) => {
              const payer = typeof p.payer === 'object' && p.payer ? (p.payer as User) : null
              const payee = typeof p.payee === 'object' && p.payee ? (p.payee as User) : null
              const listing =
                typeof p.listing === 'object' && p.listing ? (p.listing as Listing) : null
              return (
                <tr key={String(p.id)}>
                  <td data-label="Reference" className="py-3.5 px-5 font-extrabold text-[var(--primary)]">
                    {p.referenceCode}
                  </td>
                  <td data-label="Buyer" className="py-3.5 px-5 text-xs">
                    {payer?.fullName || 'Buyer'}
                  </td>
                  <td data-label="Seller" className="py-3.5 px-5 text-xs">
                    {payee?.fullName || 'Seller'}
                  </td>
                  <td data-label="Property" className="py-3.5 px-5 text-xs font-semibold">
                    {listing?.title || 'Property'}
                  </td>
                  <td data-label="Method" className="py-3.5 px-5 uppercase text-xs font-bold">
                    {p.method}
                  </td>
                  <td data-label="Amount" className="py-3.5 px-5 font-black">
                    {formatPeso(p.amount)}
                  </td>
                  <td data-label="Status" className="py-3.5 px-5">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--surface-soft)] text-xs font-extrabold capitalize">
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </PortalShell>
  )
}
