'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminModerateListingAction } from '@/app/actions/kasafide'
import { RejectReasonDialog } from '@/components/kasafide/RejectReasonDialog'

const LISTING_REJECT_REASONS = [
  'Incomplete property documents. Please re-upload a valid Transfer Certificate of Title (TCT).',
  'Photos are unclear or do not accurately represent the property.',
  'Property details (price, area, amenities) are inaccurate or misleading.',
  'Listing violates Kasafide community guidelines.',
  'Duplicate listing: this property has already been posted.',
  'Property address could not be verified in Sta. Maria, Bulacan.',
]

export function AdminListingDetailActions({
  listingId,
  title,
  status,
}: {
  listingId: string
  title: string
  status: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function run(input: Parameters<typeof adminModerateListingAction>[0], after?: () => void) {
    setError('')
    setNotice('')
    startTransition(async () => {
      const res = await adminModerateListingAction(input).catch(() => ({
        ok: false as const,
        error: 'Could not update this listing. Please try again.',
        message: undefined,
      }))
      if (!res.ok) {
        setError(res.error || 'Could not update this listing. Please try again.')
        return
      }
      setNotice(res.message || 'Saved.')
      after?.()
      router.refresh()
    })
  }

  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending || isRejected}
          onClick={() => setRejectOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[var(--danger)]/15 text-[var(--danger)] text-sm font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRejected ? 'Rejected' : 'Reject'}
        </button>
        <button
          type="button"
          disabled={isPending || isApproved}
          onClick={() => run({ listingId, status: 'approved', titleVerified: true })}
          className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-sm font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApproved ? 'Approved' : 'Approve & Publish'}
        </button>
        {isApproved && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (window.confirm(`Close "${title}"? It will be removed from the public catalog.`)) {
                run({ listingId, status: 'closed' })
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            Close Listing
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
        title="Reject Listing"
        description="Select a reason. The seller will see this message and know what to fix before resubmitting."
        reasons={LISTING_REJECT_REASONS}
        pending={isPending}
        error={error}
        onConfirm={(reason) =>
          run({ listingId, status: 'rejected', rejectionReason: reason }, () =>
            setRejectOpen(false),
          )
        }
      />
    </div>
  )
}
