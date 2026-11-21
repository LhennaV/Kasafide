import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { IdentityVerificationForm } from '@/components/kasafide/ProfileSettingsForms'

export default async function SellerVerificationPage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  return (
    <PortalShell
      user={user}
      activePage="verification"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">
          Seller Identity Verification
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Submit your valid government ID and live selfie so a Kasafide administrator can verify your landowner account.
        </p>
      </div>
      <IdentityVerificationForm currentStatus={user.accountStatus} />
    </PortalShell>
  )
}
