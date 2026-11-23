'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminModerateUserAction } from '@/app/actions/kasafide'
import { RejectReasonDialog } from '@/components/kasafide/RejectReasonDialog'

const VERIFY_REASONS = [
  'Submitted ID is expired or not a valid government-issued ID.',
  'The name on the ID does not match the name on the account.',
  'The ID photo is blurry, cropped, or unreadable.',
  'The selfie does not clearly match the photo on the ID.',
  'Documents appear tampered or edited.',
  'Incomplete submission: one or more required details are missing.',
]

export function AdminUserDetailActions({
  userId,
  fullName,
  accountStatus,
  canModerate,
}: {
  userId: string
  fullName: string
  accountStatus: string
  canModerate: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  if (!canModerate) return null

  function run(input: Parameters<typeof adminModerateUserAction>[0], after?: () => void) {
    setError('')
    setNotice('')
    startTransition(async () => {
      const res = await adminModerateUserAction(input).catch(() => ({
        ok: false as const,
        error: 'Could not update this account. Please try again.',
        message: undefined,
      }))
      if (!res.ok) {
        setError(res.error || 'Something went wrong. Please try again.')
        return
      }
      setNotice(res.message || 'Saved.')
      after?.()
      router.refresh()
    })
  }

  const isVerified = accountStatus === 'verified'
  const isRejected = accountStatus === 'rejected'
  const isSuspended = accountStatus === 'suspended'

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending || isRejected}
          onClick={() => setRejectOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[var(--danger)]/15 text-[var(--danger)] text-sm font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRejected ? 'Already Rejected' : 'Reject'}
        </button>
        <button
          type="button"
          disabled={isPending || isVerified}
          onClick={() => run({ targetUserId: userId, accountStatus: 'verified' })}
          className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-sm font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerified ? 'Verified' : 'Approve'}
        </button>
        {!isSuspended && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (
                window.confirm(
                  `Suspend ${fullName}? They will lose access until an admin restores the account.`,
                )
              ) {
                run({ targetUserId: userId, accountStatus: 'suspended' })
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            Suspend
          </button>
        )}
      </div>
      {error && !rejectOpen && (
        <p role="alert" className="text-xs font-bold text-[var(--danger)]">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-xs font-bold text-[var(--success)]">
          {notice}
        </p>
      )}

      <RejectReasonDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject Verification"
        description={`Select a reason for rejecting ${fullName}. They will see this message and know what to fix.`}
        reasons={VERIFY_REASONS}
        pending={isPending}
        error={error}
        onConfirm={(reason) =>
          run({ targetUserId: userId, accountStatus: 'rejected', reason }, () =>
            setRejectOpen(false),
          )
        }
      />
    </div>
  )
}
