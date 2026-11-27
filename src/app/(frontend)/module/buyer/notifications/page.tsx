import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'

export default async function BuyerNotificationsPage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser()
  return (
    <PortalShell
      user={user}
      activePage="notifications"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Notifications</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Viewing confirmations, payment updates, and verification notices.
        </p>
      </div>
      <div className="space-y-3 w-full">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-2xl border p-4 ${
              n.unread
                ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                : 'border-[var(--border)] bg-[var(--surface)]'
            }`}
          >
            <div className="font-extrabold text-sm text-[var(--text)]">{n.title}</div>
            <p className="text-xs sm:text-sm text-[var(--text-soft)] mt-1">{n.body}</p>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="p-10 rounded-2xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
            No notifications yet.
          </div>
        )}
      </div>
    </PortalShell>
  )
}
