import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { AccountSettingsForm } from '@/components/kasafide/ProfileSettingsForms'

export default async function BuyerSettingsPage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser()
  return (
    <PortalShell
      user={user}
      activePage="settings"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Account Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Update your personal details and contact preferences.
        </p>
      </div>
      <AccountSettingsForm user={user} />
    </PortalShell>
  )
}
