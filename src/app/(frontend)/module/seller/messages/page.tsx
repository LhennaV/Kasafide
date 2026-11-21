import { requirePortalUser } from '@/lib/portal-guard'
import { buildThreadsForUser } from '@/lib/portal-threads'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { MessengerWorkspace } from '@/components/kasafide/MessengerWorkspace'

export default async function SellerMessagesPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const threads = await buildThreadsForUser(rawUser)
  return (
    <PortalShell
      user={user}
      activePage="messages"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <MessengerWorkspace threads={threads} canRequestPayment />
    </PortalShell>
  )
}
