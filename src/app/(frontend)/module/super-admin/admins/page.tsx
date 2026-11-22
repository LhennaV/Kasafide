import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { SuperAdminAdminsManager } from '../SuperAdminClient'
import type { User } from '@/payload-types'

export default async function SuperAdminAdminsPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const res = await payload
    .find({
      collection: 'users',
      user: rawUser,
      overrideAccess: false,
      where: { role: { in: ['admin', 'superadmin', 'super_duper_admin'] } },
      limit: 50,
      sort: '-createdAt',
    })
    .catch(() => ({ docs: [] }))

  let docs = res.docs as User[]
  if (docs.length === 0) {
    docs = [
      {
        id: 90003,
        fullName: 'Staff Admin (Admin Demo)',
        email: 'admin@kasafide.ph',
        role: 'admin',
        accountStatus: 'verified',
        createdAt: '2026-01-01T00:00:00.000Z',
      } as unknown as User,
      {
        id: 90004,
        fullName: 'Super Administrator (Super Admin Demo)',
        email: 'superadmin@kasafide.ph',
        role: 'superadmin',
        accountStatus: 'verified',
        createdAt: '2026-01-01T00:00:00.000Z',
      } as unknown as User,
    ]
  }

  const admins = docs.map((u) => ({
    id: String(u.id),
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    accountStatus: u.accountStatus,
    createdAt: u.createdAt,
  }))

  return (
    <PortalShell
      user={user}
      activePage="admins"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Admin Management</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Provision, audit, or suspend platform administrator accounts.
        </p>
      </div>
      <SuperAdminAdminsManager admins={admins} />
    </PortalShell>
  )
}
