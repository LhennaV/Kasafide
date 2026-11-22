import { getCachedPublicMarketplace, formatPeso } from '@/lib/kasafide-data'
import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import type { Payment } from '@/payload-types'

export default async function AdminAnalyticsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const [{ listings, barangays }, payRes] = await Promise.all([
    getCachedPublicMarketplace(),
    payload
      .find({
        collection: 'payments',
        user: rawUser,
        overrideAccess: false,
        limit: 100,
      })
      .catch(() => ({ docs: [] })),
  ])

  const topBarangays = barangays
    .filter((b) => b.listingCount > 0)
    .sort((a, b) => b.listingCount - a.listingCount)
    .slice(0, 8)

  const totalVolume = (payRes.docs as Payment[])
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  return (
    <PortalShell
      user={user}
      activePage="analytics"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Platform Analytics</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Live geographic distribution and transaction metrics across Sta. Maria, Bulacan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">
            Confirmed Payment Volume
          </div>
          <div className="text-3xl font-black text-[var(--primary)] mt-1">
            {formatPeso(totalVolume)}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">
            Active Barangays with Listings
          </div>
          <div className="text-3xl font-black text-[var(--success)] mt-1">
            {topBarangays.length} / {barangays.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">
            Approved Live Inventory
          </div>
          <div className="text-3xl font-black text-[var(--info)] mt-1">{listings.length}</div>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="font-extrabold text-base mb-4">Listings Density by Barangay</h2>
        <div className="space-y-3">
          {topBarangays.map((b) => {
            const pct = listings.length ? Math.round((b.listingCount / listings.length) * 100) : 0
            return (
              <div key={b.id}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Brgy. {b.name}</span>
                  <span>{b.listingCount} listings</span>
                </div>
                <div className="h-3 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{ width: `${Math.max(8, pct)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PortalShell>
  )
}
