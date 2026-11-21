import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'

export default async function SuperAdminNotificationsPage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser([
    'superadmin',
    'super_duper_admin',
  ])
  return (
    <PortalShell
      user={user}
      activePage="notifications"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <h1 className="text-2xl sm:text-3xl font-black mb-5">Super Admin Notifications</h1>
      <div className="space-y-3 max-w-3xl">
        {notifications.map((n) => (
          <div key={n.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="font-extrabold text-sm">{n.title}</div>
            <p className="text-xs sm:text-sm text-[var(--text-soft)] mt-1">{n.body}</p>
          </div>
        ))}
      </div>
    </PortalShell>
  )
}
