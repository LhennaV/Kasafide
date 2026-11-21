'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Why don’t newly posted properties appear immediately in Browse?',
    a: 'Every property submitted on Kasafide enters a Pending Review queue so a Kasafide administrator can verify the seller’s Government ID, live selfie, and Transfer Certificate of Title (TCT) or Deed of Sale first.',
  },
  {
    q: 'How does Kasafide protect buyers from fake rental deposits?',
    a: 'Only verified landowners who have signed the Kasafide Seller Memorandum of Agreement (MOA) can publish listings and receive tracked QR Ph, GCash, or Maya payment confirmations inside the platform.',
  },
  {
    q: 'Which areas are supported?',
    a: 'Kasafide is purpose-built for all 24 barangays of Sta. Maria, Bulacan — with dedicated barangay boundary mapping and local filtering.',
  },
  {
    q: 'What roles exist on Kasafide?',
    a: 'Kasafide features four dedicated role portals: Buyer/Renter, Seller/Lister, Admin Moderator, and Super Admin (with Audit Trail and Admin Management).',
  },
  {
    q: 'Can I use Kasafide on my phone?',
    a: 'Yes! Kasafide features full mobile integration including bottom navigation bars, bottom-sheet property filters, mobile card tables, touch-friendly barangay map controls, and Home Screen PWA support.',
  },
]

export function FaqsClient() {
  const [query, setQuery] = useState('')
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const filtered = FAQS.filter(
    (item) =>
      !query.trim() ||
      item.q.toLowerCase().includes(query.toLowerCase()) ||
      item.a.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search frequently asked questions…"
        className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm"
      />
      <div className="space-y-3">
        {filtered.map((item, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={item.q}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full px-5 py-4 text-left font-extrabold text-sm sm:text-base text-[var(--text)] flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{item.q}</span>
                <span className="text-[var(--primary)] font-black">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-[var(--text-soft)] leading-relaxed border-t border-[var(--border)]/50 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
