'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Pick-a-reason dialog used by the admin detail pages. The chosen (or typed) reason is what the
 * user or seller sees, so they know what to fix before resubmitting.
 */
export function RejectReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  reasons,
  pending,
  error,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  reasons: string[]
  pending: boolean
  error: string
  onConfirm: (reason: string) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [custom, setCustom] = useState('')
  const [localError, setLocalError] = useState('')

  function submit() {
    const reason = custom.trim() || (selected !== null ? reasons[selected] : '')
    if (!reason) {
      setLocalError('Please select or write a rejection reason.')
      return
    }
    setLocalError('')
    onConfirm(reason)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSelected(null)
          setCustom('')
          setLocalError('')
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <fieldset className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
          <legend className="sr-only">Rejection reason</legend>
          {reasons.map((r, i) => (
            <label
              key={r}
              className={`flex items-start gap-3 p-3 rounded-xl border text-sm cursor-pointer ${
                selected === i
                  ? 'border-[var(--danger)] bg-[var(--danger)]/10'
                  : 'border-[var(--border)] bg-[var(--bg)]'
              }`}
            >
              <input
                type="radio"
                name="rejectReason"
                className="mt-0.5 accent-[var(--danger)]"
                checked={selected === i}
                onChange={() => setSelected(i)}
              />
              <span>{r}</span>
            </label>
          ))}
        </fieldset>

        <div>
          <label htmlFor="rejectCustom" className="block text-xs font-bold mb-1.5">
            Or write your own reason
          </label>
          <textarea
            id="rejectCustom"
            rows={3}
            maxLength={1000}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="This replaces the selected reason above."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          />
        </div>

        {(localError || error) && (
          <p role="alert" className="text-xs font-bold text-[var(--danger)]">
            {localError || error}
          </p>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={submit}
            className="px-4 py-2.5 rounded-xl bg-[var(--danger)] text-white text-sm font-extrabold cursor-pointer disabled:opacity-60"
          >
            {pending ? 'Rejecting…' : 'Confirm Rejection'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
