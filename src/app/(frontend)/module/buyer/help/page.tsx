import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { MeowrieAssistant } from '@/components/kasafide/MeowrieAssistant'

export default async function BuyerHelpPage() {
  const { user, notifications, unreadMessageCount } = await requirePortalUser()
  return (
    <PortalShell
      user={user}
      activePage="help"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-5">
        <h1 className="text-2xl font-black text-[var(--text)]">Help &amp; Meowrie Assistant</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Instant guidance on booking viewings, verifying owners, and making safe payments.
        </p>
      </div>
      <MeowrieAssistant />
    </PortalShell>
  )
}
