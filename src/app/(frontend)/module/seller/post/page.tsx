import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { PortalShell } from '@/components/kasafide/PortalShell'
import { SellerPostFormClient } from './SellerPostFormClient'

export default async function SellerPostPage() {
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'seller',
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()
  const brgyRes = await payload
    .find({
      collection: 'barangays',
      user: rawUser,
      overrideAccess: false,
      limit: 50,
      sort: 'name',
    })
    .catch(() => ({ docs: [] }))

  const fallbackBrgys = [
    { id: '1', name: 'Pulong Buhangin' },
    { id: '2', name: 'Poblacion' },
    { id: '3', name: 'Caypombo' },
    { id: '4', name: 'Santa Clara' },
    { id: '5', name: 'Guyong' },
  ]

  const barangays =
    brgyRes.docs.length > 0
      ? brgyRes.docs.map((b) => ({ id: String(b.id), name: b.name }))
      : fallbackBrgys

  return (
    <PortalShell
      user={user}
      activePage="post"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">Post a Property</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          All new submissions enter Kasafide Admin review to verify title authenticity before going public.
        </p>
      </div>
      <SellerPostFormClient barangays={barangays} />
    </PortalShell>
  )
}
