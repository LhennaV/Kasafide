import { getPayloadClient } from '@/lib/payload'
import { formatPeso } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import type { Listing, Payment, User } from '@/payload-types'

export default async function SellerTenantsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const payRes = await payload
    .find({
      collection: 'payments',
      user: rawUser,
      overrideAccess: false,
      where: {
        and: [{ payee: { equals: rawUser.id } }, { status: { equals: 'confirmed' } }],
      },
      depth: 1,
      limit: 50,
    })
    .catch(() => ({ docs: [] }))

  return (
    <PortalShell
      user={user}
      activePage="tenants"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">
          My Tenants &amp; Security Deposits
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Active confirmed tenants and security deposit balances across your rental units.
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {payRes.docs.length > 0 ? (
          <table className="kf-data-table w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-extrabold uppercase text-[var(--text-muted)]">
                <th className="py-3.5 px-5">Tenant</th>
                <th className="py-3.5 px-5">Property</th>
                <th className="py-3.5 px-5">Ledger Type</th>
                <th className="py-3.5 px-5">Amount Held / Paid</th>
                <th className="py-3.5 px-5">Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {payRes.docs.map((p: Payment) => {
                const payer = typeof p.payer === 'object' && p.payer ? (p.payer as User) : null
                const listing =
                  typeof p.listing === 'object' && p.listing ? (p.listing as Listing) : null
                return (
                  <tr key={String(p.id)}>
                    <td data-label="Tenant" className="py-3.5 px-5 font-extrabold">
                      {payer?.fullName || 'Verified Tenant'}
                    </td>
                    <td data-label="Property" className="py-3.5 px-5">
                      {listing?.title || 'Rental Unit'}
                    </td>
                    <td data-label="Type" className="py-3.5 px-5 capitalize text-xs font-bold">
                      {p.paymentType.replace('_', ' ')}
                    </td>
                    <td data-label="Amount" className="py-3.5 px-5 font-black text-[var(--primary)]">
                      {formatPeso(p.amount)}
                    </td>
                    <td data-label="Period" className="py-3.5 px-5 text-xs text-[var(--text-muted)]">
                      {p.periodLabel || 'Active'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-sm text-[var(--text-muted)]">
            No active confirmed tenant ledgers yet.
          </div>
        )}
      </div>
    </PortalShell>
  )
}
