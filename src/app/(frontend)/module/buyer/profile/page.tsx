import Link from 'next/link'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'

export default async function BuyerProfilePage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser()
  return (
    <PortalShell
      user={user}
      activePage="profile"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 max-w-2xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#5B3A8E] text-[#FBF6F0] font-black text-xl flex items-center justify-center">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text)]">{user.fullName}</h1>
            <div className="text-xs font-bold text-[var(--primary)] capitalize">
              {user.role} &middot; {user.accountStatus}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[var(--border)] text-sm">
          <div>
            <div className="text-xs text-[var(--text-muted)] font-bold">Email</div>
            <div className="font-semibold">{user.email}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-bold">Phone</div>
            <div className="font-semibold">{user.phone || 'Not set'}</div>
          </div>
        </div>
        {user.bio && <p className="text-sm text-[var(--text-soft)]">{user.bio}</p>}
        <Link
          href="/module/buyer/settings"
          className="inline-block px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-xs"
        >
          Edit Profile &amp; Settings
        </Link>
      </div>
    </PortalShell>
  )
}
