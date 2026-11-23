import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import {
  AccountSettingsForm,
  ChangePasswordForm,
} from '@/components/kasafide/ProfileSettingsForms'

export default async function AdminSettingsPage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser([
    'admin',
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
      <h1 className="text-2xl sm:text-3xl font-black mb-5">Admin Settings</h1>
      <div className="space-y-6">
        <AccountSettingsForm user={user} />
        <ChangePasswordForm isDemo={Boolean(user.isDemo)} />
      </div>
    </PortalShell>
  )
}
