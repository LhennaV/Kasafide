import { requirePortalUser } from '@/lib/portal-guard'
import { buildSupportThreadsForAdmin } from '@/lib/portal-threads'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { MessengerWorkspace } from '@/components/kasafide/MessengerWorkspace'

/** Live-agent inbox: questions Meowrie couldn't answer. Shared by every admin. */
export default async function AdminSupportPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const threads = await buildSupportThreadsForAdmin(rawUser)
  return (
    <PortalShell user={user} activePage="support" notifications={notifications} unreadMessageCount={unreadMessageCount}>
      <MessengerWorkspace threads={threads} mode="admin-support" />
    </PortalShell>
  )
}
