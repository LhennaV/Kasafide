import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { AdminUsersClient } from './AdminUsersClient'
import type { User } from '@/payload-types'

export default async function AdminUsersPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'users',
    user: rawUser,
    overrideAccess: false,
    limit: 100,
    sort: '-createdAt',
  })

  const rows = (res.docs as User[]).map((u) => ({
    id: String(u.id),
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    accountStatus: u.accountStatus,
    moaSigned: Boolean(u.moaSignedAt),
  }))

  return (
    <PortalShell
      user={user}
      activePage="users"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Users Directory</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Verify buyer and seller government IDs or manage account standing.
        </p>
      </div>
      <AdminUsersClient rows={rows} />
    </PortalShell>
  )
}
