import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { PublicFooter } from '@/components/kasafide/PublicFooter'

export const metadata: Metadata = {
  title: 'Kasafide – Privacy Policy',
}

const ITEMS = [
  {
    id: 'collect',
    num: '01',
    title: 'Information We Collect',
    body: 'Kasafide collects only the personal and property documentation required to operate a fraud-resistant housing marketplace in Sta. Maria, Bulacan — including account profile details, Google OAuth identifiers when chosen, and verification records.',
  },
  {
    id: 'consent',
    num: '02',
    title: 'Identity & Document Data Consent',
    body: 'Submitted government IDs, live selfies, and land titles are restricted strictly to authorized Kasafide verification administrators and are never exposed publicly to anonymous visitors.',
  },
  {
    id: 'rights',
    num: '03',
    title: 'Your Rights Under the Philippine Data Privacy Act (RA 10173)',
    body: 'You retain the right to access, correct, update, or request deletion of your personal profile data through Account Settings or Kasafide Support.',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 mb-6">
          <h1 className="text-3xl font-black text-[var(--text)] mb-2">Privacy Policy</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Effective Date: January 1, 2026 &middot; Republic Act No. 10173 (Data Privacy Act of 2012) Compliant
          </p>
        </div>
        <div className="space-y-5">
          {ITEMS.map((item) => (
            <section
              key={item.id}
              id={item.id}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7"
            >
              <div className="text-xs font-extrabold text-[var(--primary)] mb-1">
                {item.num} &middot; Privacy Safeguard
              </div>
              <h2 className="text-xl font-extrabold text-[var(--text)] mb-2">{item.title}</h2>
              <p className="text-sm text-[var(--text-soft)] leading-relaxed">{item.body}</p>
            </section>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
