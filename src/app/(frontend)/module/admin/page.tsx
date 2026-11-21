import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { formatPeso } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import type { Listing, User } from '@/payload-types'

export default async function AdminDashboardPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()

  const [listingsRes, usersRes, pendingVerifRes, reportsRes] = await Promise.all([
    payload.find({
      collection: 'listings',
      user: rawUser,
      overrideAccess: false,
      depth: 1,
      limit: 50,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'users',
      user: rawUser,
      overrideAccess: false,
      limit: 50,
      sort: '-createdAt',
    }),
    payload.count({
      collection: 'users',
      user: rawUser,
      overrideAccess: false,
      where: { accountStatus: { equals: 'pending' } },
    }),
    payload.count({
      collection: 'listing-reports',
      user: rawUser,
      overrideAccess: false,
      where: { status: { in: ['open', 'investigating'] } },
    }),
  ])

  const allListings = listingsRes.docs as Listing[]
  const allUsers = usersRes.docs as User[]
  const verifiedSellers = allUsers.filter(
    (u) => u.role === 'seller' && u.accountStatus === 'verified',
  ).length
  const pendingListings = allListings.filter((l) => l.status === 'pending')
  const recentSellers = allUsers.filter((u) => u.role === 'seller').slice(0, 5)

  const typeBreakdown = ['house', 'apartment', 'condo', 'commercial', 'lot'].map((t) => ({
    type: t,
    count: allListings.filter((l) => l.propertyType === t).length,
  }))

  return (
    <PortalShell
      user={user}
      activePage="dashboard"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Admin Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Platform overview, seller ID verification, and listing title moderation
        </p>
      </div>

      {/* 4 Stat Cards (Preserved from admin.html) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">Total Listings</div>
          <div className="text-3xl font-black text-[var(--primary)] mt-1">{allListings.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">Active Users</div>
          <div className="text-3xl font-black text-[var(--info)] mt-1">{allUsers.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">Verified Sellers</div>
          <div className="text-3xl font-black text-[var(--success)] mt-1">{verifiedSellers}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">
            Pending Verifications
          </div>
          <div className="text-3xl font-black text-[var(--warning)] mt-1">
            {pendingVerifRes.totalDocs}
          </div>
        </div>
      </div>

      {/* 2x2 Grid (Preserved from admin.html) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-base">Recent Listings</h2>
            <Link href="/module/admin/listings" className="text-xs font-bold text-[var(--primary)]">
              View All &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {allListings.slice(0, 5).map((l) => (
              <div
                key={String(l.id)}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--surface-soft)] text-xs"
              >
                <div className="min-w-0">
                  <div className="font-extrabold text-[var(--text)] truncate">{l.title}</div>
                  <div className="text-[var(--text-muted)]">{formatPeso(l.price)}</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full font-extrabold uppercase shrink-0 ${
                    l.status === 'approved'
                      ? 'bg-[var(--success)]/15 text-[var(--success)]'
                      : 'bg-[var(--warning)]/15 text-[var(--warning)]'
                  }`}
                >
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="font-extrabold text-base mb-4">Pending Actions</h2>
          <div className="space-y-3 text-sm">
            <Link
              href="/module/admin/listings"
              className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-soft)] hover:border-[var(--primary)] border border-transparent transition"
            >
              <div>
                <div className="font-extrabold">Listings Awaiting TCT Review</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Approve or reject newly submitted properties
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[var(--warning)]/20 text-[var(--warning)] font-black text-xs">
                {pendingListings.length}
              </span>
            </Link>

            <Link
              href="/module/admin/users"
              className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-soft)] hover:border-[var(--primary)] border border-transparent transition"
            >
              <div>
                <div className="font-extrabold">Seller ID Verifications</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Government ID + live camera selfie queue
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-black text-xs">
                {pendingVerifRes.totalDocs}
              </span>
            </Link>

            <Link
              href="/module/admin/reports"
              className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-soft)] hover:border-[var(--primary)] border border-transparent transition"
            >
              <div>
                <div className="font-extrabold">Open Listing Reports</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Investigate buyer-submitted safety flags
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[var(--danger)]/20 text-[var(--danger)] font-black text-xs">
                {reportsRes.totalDocs}
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-base">Seller Registrations</h2>
            <Link href="/module/admin/users" className="text-xs font-bold text-[var(--primary)]">
              View All &rarr;
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentSellers.map((s) => (
              <div
                key={String(s.id)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-soft)] text-xs"
              >
                <div>
                  <div className="font-extrabold text-[var(--text)]">{s.fullName}</div>
                  <div className="text-[var(--text-muted)]">{s.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[var(--bg)] font-bold capitalize">
                  {s.accountStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="font-extrabold text-base mb-4">Listing Breakdown by Type</h2>
          <div className="space-y-3">
            {typeBreakdown.map((item) => {
              const pct = allListings.length
                ? Math.round((item.count / allListings.length) * 100)
                : 0
              return (
                <div key={item.type}>
                  <div className="flex justify-between text-xs font-bold mb-1 capitalize">
                    <span>{item.type}</span>
                    <span>
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--primary)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PortalShell>
  )
}
