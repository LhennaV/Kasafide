import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { ProfileCard } from '@/components/kasafide/ProfileCard'

export default async function SellerProfilePage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
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
      <ProfileCard
        user={user}
        settingsHref="/module/seller/settings"
        extra={[
          { label: 'GCash Payout', value: user.gcashNumber || 'Not configured' },
          { label: 'Maya Payout', value: user.mayaNumber || 'Not configured' },
        ]}
      />
    </PortalShell>
  )
}
