import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { BecomeSellerClient } from './BecomeSellerClient'

export default async function BecomeSellerPage() {
  // Only buyers can upgrade; a seller or admin opening this lands on their own portal.
  const { user, notifications, unreadMessageCount } = await requirePortalUser(['buyer'])
  return (
    <PortalShell user={user} activePage="become-seller" notifications={notifications} unreadMessageCount={unreadMessageCount}>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Become a Seller</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Sell or rent out a property in Sta. Maria using the account you already have.
        </p>
      </div>
      <BecomeSellerClient fullName={user.fullName} accountStatus={user.accountStatus} />
    </PortalShell>
  )
}
