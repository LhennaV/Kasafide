import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { ProfileCard } from '@/components/kasafide/ProfileCard'

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
      <ProfileCard user={user} settingsHref="/module/admin/settings" />
    </PortalShell>
  )
}
