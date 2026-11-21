import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { AccountSettingsForm } from '@/components/kasafide/ProfileSettingsForms'

export default async function SuperAdminSettingsPage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser([
    'superadmin',
    'super_duper_admin',
  ])
  return (
    <PortalShell
      user={user}
      activePage="settings"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <h1 className="text-2xl sm:text-3xl font-black mb-5">Super Admin Settings</h1>
      <AccountSettingsForm user={user} />
    </PortalShell>
  )
}
