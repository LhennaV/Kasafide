import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { requirePortalUser } from '@/lib/portal-guard'
import { signedUrl } from '@/lib/storage'
import { PortalShell } from '@/components/kasafide/PortalShell'
import type { User, VerificationSubmission } from '@/payload-types'
import { AdminUserDetailActions } from './AdminUserDetailClient'

export const metadata: Metadata = {
  title: 'Kasafide – User Details',
}

const ID_TYPE_LABELS: Record<VerificationSubmission['idType'], string> = {
  drivers_license: "Driver's License",
  passport: 'Philippine Passport',
  philid: 'PhilSys National ID',
  umid: 'UMID',
  postal_id: 'Postal ID',
}

const ROLE_LABELS: Record<User['role'], string> = {
  buyer: 'Buyer / Renter',
  seller: 'Seller',
  admin: 'Admin',
  superadmin: 'Super Admin',
  super_duper_admin: 'Super Admin',
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusBadgeClass(status: string): string {
  if (status === 'verified' || status === 'approved')
    return 'bg-[var(--success)]/15 text-[var(--success)]'
  if (status === 'rejected' || status === 'suspended')
    return 'bg-[var(--danger)]/15 text-[var(--danger)]'
  return 'bg-[var(--warning)]/15 text-[var(--warning)]'
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-bold text-[var(--text)] break-words">{value}</dd>
    </div>
  )
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { rawUser, user, notifications, unreadMessageCount } = await requirePortalUser([
    'admin',
    'superadmin',
    'super_duper_admin',
  ])
  const payload = await getPayloadClient()

  const target = (await payload
    .findByID({ collection: 'users', id, user: rawUser, overrideAccess: false, depth: 0 })
    .catch(() => null)) as User | null
  if (!target) notFound()

  const [submissionsRes, listingCount] = await Promise.all([
    payload
      .find({
        collection: 'verification-submissions',
        user: rawUser,
        overrideAccess: false,
        where: { user: { equals: target.id } },
        sort: '-createdAt',
        limit: 10,
        depth: 0,
      })
      .catch(() => ({ docs: [] as VerificationSubmission[] })),
    target.role === 'seller'
      ? payload
          .count({
            collection: 'listings',
            user: rawUser,
            overrideAccess: false,
            where: { seller: { equals: target.id } },
          })
          .then((r) => r.totalDocs)
          .catch(() => 0)
      : Promise.resolve(0),
  ])

  const submissions = submissionsRes.docs as VerificationSubmission[]
  // Short-lived links to the private ID photo + selfie, so the admin can compare them.
  const files = await Promise.all(
    submissions.map(async (s) => ({
      id: await signedUrl(s.idImagePath),
      selfie: await signedUrl(s.selfieImagePath),
    })),
  )
  const latest = submissions[0]
  const lastRejection = submissions.find((s) => s.status === 'rejected' && s.reviewerNotes)
  const savedCount = target.savedListings?.length ?? 0
  const isMember = target.role === 'buyer' || target.role === 'seller'
  const initials =
    `${target.firstName?.[0] ?? ''}${target.lastName?.[0] ?? ''}`.toUpperCase() ||
    target.email.slice(0, 2).toUpperCase()

  return (
    <PortalShell
      user={user}
      activePage="users"
      notifications={notifications}
      unreadMessageCount={unreadMessageCount}
    >
      <div className="mb-4">
        <Link
          href="/module/admin/users"
          className="text-xs font-bold text-[var(--primary)] hover:underline"
        >
          &larr; Back to Users
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)]">{target.fullName}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 break-all">
            {target.email} &middot; Joined {formatDate(target.createdAt)}
          </p>
        </div>
        <AdminUserDetailActions
          userId={String(target.id)}
          fullName={target.fullName ?? target.email}
          accountStatus={target.accountStatus}
          canModerate={isMember}
        />
      </div>

      <div className="space-y-5">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 flex items-center gap-4">
          <div
            className={`w-16 h-16 shrink-0 rounded-full font-black text-xl flex items-center justify-center ${
              target.role === 'buyer'
                ? 'bg-[#FF8A65] text-[#2B1B3D]'
                : 'bg-[#5B3A8E] text-[#FBF6F0]'
            }`}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-lg text-[var(--text)]">{target.fullName}</div>
            <div className="text-xs text-[var(--text-muted)] break-all">{target.email}</div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[var(--surface-soft)] text-[var(--text)]">
                {ROLE_LABELS[target.role]}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${statusBadgeClass(target.accountStatus)}`}
              >
                {target.accountStatus}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-4">
            Account Information
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoItem label="Phone" value={target.phone || '—'} />
            <InfoItem label="Joined" value={formatDate(target.createdAt)} />
            {target.role === 'seller' ? (
              <InfoItem label="Total Listings" value={listingCount} />
            ) : (
              <InfoItem label="Saved Listings" value={savedCount} />
            )}
            <InfoItem label="Verified On" value={formatDate(target.verifiedAt)} />
            <InfoItem label="Verification Expiry" value={formatDate(target.verificationExpiry)} />
            <InfoItem label="Last Submitted" value={formatDate(latest?.createdAt)} />
            {target.role === 'seller' && (
              <InfoItem
                label="MOA"
                value={
                  target.moaSignedAt ? `Signed ${formatDate(target.moaSignedAt)}` : 'Not signed'
                }
              />
            )}
          </dl>
        </section>

        {lastRejection && (
          <section className="rounded-3xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-5">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--danger)] mb-1.5">
              Previous Rejection Reason
            </h2>
            <p className="text-sm text-[var(--text)]">{lastRejection.reviewerNotes}</p>
          </section>
        )}

        {isMember && (
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-4">
              ID Verification Submissions
            </h2>
            {submissions.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No ID submitted yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]/60">
                {submissions.map((s, i) => (
                  <li
                    key={s.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4"
                  >
                    <div className="flex gap-2 shrink-0">
                      {(
                        [
                          ['Government ID', files[i]?.id],
                          ['Live selfie', files[i]?.selfie],
                        ] as const
                      ).map(([label, url]) =>
                        url ? (
                          <a
                            key={label}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Open ${label.toLowerCase()} in a new tab`}
                            className="block w-32 sm:w-40"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element -- signed, expiring URL */}
                            <img
                              src={url}
                              alt={`${label} of ${target.fullName}`}
                              className="w-full aspect-[4/3] object-cover rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]"
                            />
                            <span className="block text-[11px] font-bold text-[var(--text-muted)] mt-1">
                              {label}
                            </span>
                          </a>
                        ) : (
                          <div
                            key={label}
                            className="w-32 sm:w-40 aspect-[4/3] rounded-xl border border-dashed border-[var(--border)] flex items-center justify-center text-center text-[11px] text-[var(--text-muted)] p-2"
                          >
                            No {label.toLowerCase()} file
                          </div>
                        ),
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-sm text-[var(--text)]">
                        {ID_TYPE_LABELS[s.idType] ?? s.idType}
                        {s.idNumberLast4 ? ` ending in ${s.idNumberLast4}` : ''}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">
                        Submitted {formatDate(s.createdAt)} &middot;{' '}
                        {s.selfieCaptured ? 'Selfie captured' : 'No selfie'}
                      </div>
                      {s.reviewerNotes && (
                        <div className="text-xs text-[var(--text-muted)] mt-1">
                          Note: {s.reviewerNotes}
                        </div>
                      )}
                    </div>
                    <span
                      className={`self-start sm:self-center px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${statusBadgeClass(s.status)}`}
                    >
                      {s.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </PortalShell>
  )
}
