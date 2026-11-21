import Link from 'next/link'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'

export default async function SellerProfilePage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  return (
    <PortalShell
      user={user}
      activePage="profile"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 max-w-2xl space-y-4">
        <h1 className="text-2xl font-black">{user.fullName}</h1>
        <div className="text-xs font-bold text-[var(--primary)] uppercase">
          Seller &middot; {user.accountStatus}
        </div>
        <p className="text-sm text-[var(--text-soft)]">{user.bio || 'Sta. Maria Landowner'}</p>
        <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-[var(--border)]">
          <div>
            <span className="text-[var(--text-muted)] block">GCash</span>
            <strong>{user.gcashNumber || 'Not configured'}</strong>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block">Maya</span>
            <strong>{user.mayaNumber || 'Not configured'}</strong>
          </div>
        </div>
        <Link
          href="/module/seller/settings"
          className="inline-block px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-xs"
        >
          Edit Seller Settings
        </Link>
      </div>
    </PortalShell>
  )
}
