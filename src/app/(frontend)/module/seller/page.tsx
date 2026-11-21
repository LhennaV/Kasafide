import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { getCachedPublicMarketplace } from '@/lib/kasafide-data'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { BrowseCatalogClient } from '@/components/kasafide/BrowseCatalogClient'

export default async function SellerDashboardPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()

  const [myActiveRes, myPendingRes, marketplace] = await Promise.all([
    payload.count({
      collection: 'listings',
      user: rawUser,
      overrideAccess: false,
      where: {
        and: [{ seller: { equals: rawUser.id } }, { status: { equals: 'approved' } }],
      },
    }),
    payload.count({
      collection: 'listings',
      user: rawUser,
      overrideAccess: false,
      where: {
        and: [{ seller: { equals: rawUser.id } }, { status: { equals: 'pending' } }],
      },
    }),
    getCachedPublicMarketplace(),
  ])

  return (
    <PortalShell
      user={user}
      activePage="dashboard"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Seller Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Manage your property listings, MOA compliance, and verification status
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase ${
              user.accountStatus === 'verified'
                ? 'bg-[var(--success)]/15 text-[var(--success)]'
                : 'bg-[var(--warning)]/15 text-[var(--warning)]'
            }`}
          >
            {user.accountStatus === 'verified' ? '✓ Verified Seller' : `Status: ${user.accountStatus}`}
          </span>
          <Link
            href="/module/seller/post"
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold"
          >
            + Post Property
          </Link>
        </div>
      </div>

      {user.accountStatus !== 'verified' && (
        <div className="mb-6 rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning)]/12 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-extrabold text-sm text-[var(--warning)]">
              Verification Required
            </div>
            <p className="text-xs text-[var(--text-soft)] mt-1">
              To publish live listings on Kasafide, complete Government ID + live selfie verification and sign your Seller MOA.
            </p>
          </div>
          <Link
            href="/module/seller/verification"
            className="px-4 py-2.5 rounded-xl bg-[var(--warning)] text-[#2B1B3D] font-extrabold text-xs shrink-0 text-center"
          >
            Start Verification
          </Link>
        </div>
      )}

      {/* Stat Cards (Preserved from seller.html) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">Active Listings</div>
          <div className="text-3xl font-black text-[var(--success)] mt-1">
            {myActiveRes.totalDocs}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">Pending Review</div>
          <div className="text-3xl font-black text-[var(--warning)] mt-1">
            {myPendingRes.totalDocs}
          </div>
        </div>
        <Link
          href="/module/seller/viewing-requests"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--primary)] transition"
        >
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">Viewing Queue</div>
          <div className="text-sm font-extrabold text-[var(--primary)] mt-2">
            Manage Schedules &rarr;
          </div>
        </Link>
        <Link
          href="/module/seller/moa"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--primary)] transition"
        >
          <div className="text-xs font-bold uppercase text-[var(--text-muted)]">Seller MOA</div>
          <div className="text-sm font-extrabold text-[var(--primary)] mt-2">
            {user.moaSignedAt ? '✓ Signed & Active' : 'Sign Agreement &rarr;'}
          </div>
        </Link>
      </div>

      <div className="mb-4 font-extrabold text-lg text-[var(--text)]">Sta. Maria Marketplace</div>
      <BrowseCatalogClient
        listings={marketplace.listings}
        barangays={marketplace.barangays}
        detailHrefPrefix="/module/buyer/listing"
      />
    </PortalShell>
  )
}
