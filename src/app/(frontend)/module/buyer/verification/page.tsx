import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { IdentityVerificationForm } from '@/components/kasafide/ProfileSettingsForms'

export default async function BuyerVerificationPage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser()
  return (
    <PortalShell
      user={user}
      activePage="verification"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Identity Verification</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Verified buyers receive priority viewing approvals from Sta. Maria landowners.
        </p>
      </div>
      <IdentityVerificationForm currentStatus={user.accountStatus} />
    </PortalShell>
  )
}
