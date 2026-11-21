import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { MeowrieAssistant } from '@/components/kasafide/MeowrieAssistant'

export default async function SellerHelpPage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  return (
    <PortalShell
      user={user}
      activePage="help"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <h1 className="text-2xl font-black mb-4">Seller Help &amp; Meowrie Assistant</h1>
      <MeowrieAssistant />
    </PortalShell>
  )
}
