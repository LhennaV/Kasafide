import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { ProfileCard } from '@/components/kasafide/ProfileCard'

export default async function BuyerProfilePage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser()
  return (
    <PortalShell
      user={user}
      activePage="profile"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <ProfileCard user={user} settingsHref="/module/buyer/settings" />
    </PortalShell>
  )
}
