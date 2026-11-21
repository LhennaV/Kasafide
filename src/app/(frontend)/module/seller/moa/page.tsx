import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { SellerMoaClient } from './SellerMoaClient'

export default async function SellerMoaPage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  return (
    <PortalShell
      user={user}
      activePage="moa"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">
          Memorandum of Agreement
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Required accountability agreement for verified property owners on Kasafide.
        </p>
      </div>
      <SellerMoaClient
        fullName={user.fullName}
        signedAt={user.moaSignedAt}
        signatureName={user.moaSignatureName}
      />
    </PortalShell>
  )
}
