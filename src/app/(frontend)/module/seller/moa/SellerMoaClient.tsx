'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { signSellerMoaAction } from '@/app/actions/kasafide'

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
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 w-full space-y-5">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary)]">
            Kasafide Legal Compliance
          </div>
          <h2 className="text-xl font-black text-[var(--text)] mt-0.5">
            Seller &amp; Landowner Memorandum of Agreement
          </h2>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-extrabold ${
            signedAt
              ? 'bg-[var(--success)]/15 text-[var(--success)]'
              : 'bg-[var(--warning)]/15 text-[var(--warning)]'
          }`}
        >
          {signedAt ? 'Signed' : 'Unsigned'}
        </span>
      </div>

      <div className="space-y-3 text-sm text-[var(--text-soft)] leading-relaxed max-h-72 overflow-y-auto pr-2">
        <p>
          1. <strong>Truthful Property Representation:</strong> The Landowner/Seller affirms that every listing posted on Kasafide in the Municipality of Sta. Maria, Bulacan corresponds to a real property they legally own or hold written authority to lease/sell.
        </p>
        <p>
          2. <strong>Authentic Title &amp; Identification:</strong> All submitted Transfer Certificates of Title (TCT), Deeds of Sale, Tax Declarations, and Government IDs are genuine and subject to Administrator audit.
        </p>
        <p>
          3. <strong>Fair Deposit &amp; Payment Handling:</strong> Any rent, reservation fee, or security deposit confirmed through Kasafide shall be honored transparently in accordance with Philippine rental laws.
        </p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-[var(--success)]/15 text-[var(--success)] text-xs font-bold">
          {msg}
        </div>
      )}

      <div className="pt-4 border-t border-[var(--border)] space-y-3">
        <label className="block text-xs font-bold">
          Type Full Legal Name to Digitally Sign MOA
        </label>
        <input
          type="text"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] font-bold text-sm"
        />
        {signedAt && (
          <p className="text-xs text-[var(--success)] font-semibold">
            Signed by {signatureName} on {new Date(signedAt).toLocaleDateString('en-PH')}
          </p>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const res = await signSellerMoaAction(typedName)
              setMsg(res.message || res.error || 'Signed')
              router.refresh()
            })
          }}
          className="px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer"
        >
          {signedAt ? 'Update Digital Signature' : 'Sign Memorandum of Agreement'}
        </button>
      </div>
    </div>
  )
}
