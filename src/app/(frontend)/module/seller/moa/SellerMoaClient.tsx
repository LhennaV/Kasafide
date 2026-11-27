'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { signSellerMoaAction } from '@/app/actions/kasafide'
import { MoaDocument, formatMoaDate } from '@/components/kasafide/MoaDocument'
import { withToast } from '@/lib/toast'

export function SellerMoaClient({
  fullName,
  signedAt,
  signatureName,
}: {
  fullName: string
  signedAt: string | null
  signatureName: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [typedName, setTypedName] = useState(signatureName || fullName)
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="space-y-5 w-full">
      {signedAt ? (
        <div className="rounded-2xl border border-[var(--success)]/40 bg-[var(--success)]/10 p-5 flex gap-3">
          <div className="text-[var(--success)] text-xl">✓</div>
          <div>
            <div className="font-extrabold text-[var(--text)]">MOA Successfully Signed</div>
            <div className="text-sm text-[var(--text-soft)]">
              You signed this Memorandum of Agreement on <strong>{formatMoaDate(signedAt)}</strong>. A copy is
              kept on record by Kasafide. You can review the full document below.
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-5">
          <div className="font-extrabold text-[var(--text)]">Signature Required</div>
          <div className="text-sm text-[var(--text-soft)]">
            Please read the entire Memorandum of Agreement below. You must sign it before you can post a
            property on Kasafide.
          </div>
        </div>
      )}

      <MoaDocument signedAt={signedAt} signerName={signatureName} />

      {!signedAt && (
        <div data-tour="moa-sign" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <label className="flex items-start gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 accent-[var(--primary)]"
            />
            <span>
              I have fully read and understood this Memorandum of Agreement and I agree to be bound by its terms.
            </span>
          </label>
          <div>
            <label className="block text-xs font-bold mb-1.5">Type your full legal name to sign</label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] font-bold text-sm"
            />
          </div>
          <button
            type="button"
            disabled={isPending || !agreed || typedName.trim().length < 3}
            onClick={() => {
              startTransition(async () => {
                const res = await withToast(signSellerMoaAction(typedName))
                if (res.ok) router.refresh()
              })
            }}
            className="px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Signing…' : 'Sign MOA'}
          </button>
        </div>
      )}
    </div>
  )
}
