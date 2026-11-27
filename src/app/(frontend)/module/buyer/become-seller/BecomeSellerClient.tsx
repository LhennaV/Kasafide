'use client'

import { useState, useTransition } from 'react'
import { Heart, IdCard, MessageCircle, Receipt, Store } from 'lucide-react'
import { upgradeToSellerAction } from '@/app/actions/portal'
import { MoaDocument } from '@/components/kasafide/MoaDocument'
import { withToast } from '@/lib/toast'

const KEEPS = [
  { icon: MessageCircle, text: 'Your messages and conversations' },
  { icon: Receipt, text: 'Your payments and purchase history' },
  { icon: IdCard, text: 'Your identity verification' },
  { icon: Heart, text: 'Your saved listings' },
]

const NEXT = [
  'Add where buyers pay you (any e-wallet or bank) in Payments → Payout Settings',
  'Post your property with photos and an ownership document (TCT, Deed of Sale or Tax Declaration)',
  'An admin reviews it, then it goes public',
]

export function BecomeSellerClient({
  fullName,
  accountStatus,
}: {
  fullName: string
  accountStatus: string
}) {
  const [isPending, startTransition] = useTransition()
  const [agreed, setAgreed] = useState(false)
  const [name, setName] = useState(fullName)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-4 space-y-4">
        <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#5B3A8E] to-[#7B54B3] text-[#FBF6F0] p-6">
          <div className="w-11 h-11 mb-3 rounded-2xl bg-white/15 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black">One account, both sides</h2>
          <p className="text-sm opacity-90 mt-1">
            Upgrading switches your account to a Seller account. Nothing you already have is lost.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">You keep</div>
          <ul className="space-y-2">
            {KEEPS.map((k) => (
              <li key={k.text} className="flex items-center gap-2.5 text-sm">
                <span className="w-7 h-7 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center shrink-0">
                  <k.icon className="w-4 h-4" />
                </span>
                {k.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">After upgrading</div>
          <ol className="space-y-2 list-decimal pl-5 text-sm text-[var(--text-soft)]">
            {accountStatus !== 'verified' && <li>Finish identity verification (sellers must be verified)</li>}
            {NEXT.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-4">
        <div className="text-sm font-bold text-[var(--text)]">
          Step 1 · Read the Seller Memorandum of Agreement
        </div>
        <MoaDocument />

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="text-sm font-bold text-[var(--text)]">Step 2 · Sign and upgrade</div>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] font-bold text-sm"
            />
          </div>
          <button
            type="button"
            disabled={isPending || !agreed || name.trim().length < 3}
            onClick={() =>
              startTransition(async () => {
                const res = await withToast(upgradeToSellerAction({ signatureName: name, agreed }))
                // Full page load: the whole portal (nav, role badge) changes to the seller one.
                // The seller guide should open next, even if the buyer guide was closed this session.
                if (res.ok) {
                  sessionStorage.removeItem('kf-guide-done')
                  sessionStorage.removeItem('kf-tour')
                }
                if (res.ok) window.location.assign(('slug' in res && res.slug) || '/module/seller')
              })
            }
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF8A65] text-[#2B1B3D] font-black text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Upgrading…' : 'Sign MOA & become a Seller'}
          </button>
        </div>
      </div>
    </div>
  )
}
