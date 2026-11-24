import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import {
  AccountSettingsForm,
  ChangePasswordForm,
} from '@/components/kasafide/ProfileSettingsForms'

export default async function SellerSettingsPage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
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
      <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)] mb-5">Seller Settings</h1>
      <div className="space-y-6">
        <AccountSettingsForm user={user} />
        <ChangePasswordForm />
      </div>
    </PortalShell>
  )
}
