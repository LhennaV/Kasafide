import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'

export default async function AdminProfilePage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser([
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
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 max-w-xl space-y-2">
        <h1 className="text-2xl font-black">{user.fullName}</h1>
        <p className="text-xs font-bold text-[var(--primary)] uppercase">{user.role}</p>
        <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
      </div>
    </PortalShell>
  )
}
