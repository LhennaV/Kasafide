'use client'

import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateAvatarAction } from '@/app/actions/kasafide'
import type { PortalUserSummary } from '@/lib/portal-guard'
import { toast } from '@/lib/toast'
import { uploadFile } from '@/lib/upload-client'

const ROLE_LABELS: Record<PortalUserSummary['role'], string> = {
  buyer: 'Buyer / Renter',
  seller: 'Seller / Landowner',
  admin: 'Administrator',
  superadmin: 'Super Administrator',
  super_duper_admin: 'Super Administrator',
}

function formatDate(value: string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}

/**
 * Shared profile page body for every role: photo (with change/remove), name, role, status,
 * contact details, and shortcuts to edit details, change password, or reset a forgotten one.
 */
export function ProfileCard({
  user,
  settingsHref,
  extra,
}: {
  user: PortalUserSummary
  settingsHref: string
  extra?: Array<{ label: string; value: string }>
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'K'
  const photo = preview || user.avatarUrl
  const busy = uploading || isPending

  async function onFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    const res = await uploadFile('avatar', file)
    setUploading(false)
    if (!res.ok || !res.url) {
      toast.error(res.ok ? 'Upload failed.' : res.error)
      return
    }
    const url = res.url
    setPreview(URL.createObjectURL(file))
    startTransition(async () => {
      const saved = await updateAvatarAction(url).catch(() => ({
        ok: false,
        error: 'Could not reach the server. Please try again.',
      }))
      toast.result(saved, 'Profile photo updated.')
      if (saved.ok) router.refresh()
      else setPreview(null)
    })
  }

  const details: Array<{ label: string; value: string }> = [
    { label: 'Email', value: user.email },
    { label: 'Phone', value: user.phone || 'Not set' },
    { label: 'Member Since', value: formatDate(user.createdAt) },
    ...(extra ?? []),
  ]

  return (
    <div className="space-y-5 w-full">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#5B3A8E] text-[#FBF6F0] font-black text-3xl flex items-center justify-center border-4 border-[var(--primary)]/40">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- external avatar URL
              <img src={photo} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            aria-label="Change profile photo"
            className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center shadow-lg cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              void onFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)] break-words">{user.fullName}</h1>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[var(--primary)]/15 text-[var(--primary)]">
              {ROLE_LABELS[user.role]}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                user.accountStatus === 'verified'
                  ? 'bg-[var(--success)]/15 text-[var(--success)]'
                  : 'bg-[var(--warning)]/15 text-[var(--warning)]'
              }`}
            >
              {user.accountStatus}
            </span>
          </div>
          {user.bio && <p className="text-sm text-[var(--text-soft)] mt-3">{user.bio}</p>}
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            {uploading && <span className="font-bold text-[var(--text-muted)]">Uploading photo…</span>}
            {!busy && user.avatarUrl && (
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    const res = await updateAvatarAction(null).catch(() => ({
                      ok: false,
                      error: 'Could not reach the server. Please try again.',
                    }))
                    toast.result(res, 'Profile photo removed.')
                    if (res.ok) {
                      setPreview(null)
                      router.refresh()
                    }
                  })
                }
                className="font-bold text-[var(--text-muted)] hover:text-[var(--danger)] cursor-pointer"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-4">
          Account Details
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
                {d.label}
              </dt>
              <dd className="mt-1 text-sm font-bold text-[var(--text)] break-words">{d.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-4">
          Manage Account
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={settingsHref}
            className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-xs"
          >
            Edit Name &amp; Details
          </Link>
          <Link
            href={`${settingsHref}#change-password`}
            className="px-5 py-2.5 rounded-xl border border-[var(--border)] font-extrabold text-xs text-[var(--text)]"
          >
            Change Password
          </Link>
          <Link
            href="/auth/forgot-password"
            className="px-5 py-2.5 rounded-xl border border-[var(--border)] font-extrabold text-xs text-[var(--text)]"
          >
            Forgot Password
          </Link>
        </div>
      </section>
    </div>
  )
}
