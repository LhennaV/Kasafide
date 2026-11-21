import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { PublicFooter } from '@/components/kasafide/PublicFooter'

export const metadata: Metadata = {
  title: 'Kasafide – Terms of Service',
}

const SECTIONS = [
  {
    id: 'acceptance',
    num: '01',
    title: 'Acceptance of Terms',
    body: 'By creating an account, browsing listings, or using Kasafide, you confirm that you have read, understood, and agreed to these Terms of Service and our Privacy Policy governing property discovery in the Municipality of Sta. Maria, Bulacan.',
  },
  {
    id: 'accounts',
    num: '02',
    title: 'Account Registration & Verification',
    body: 'Users register as Buyers/Renters or Sellers/Listers via email credentials or Google OAuth. Sellers must submit valid government identification, a live selfie, and property ownership documents before any listing is published.',
  },
  {
    id: 'roles',
    num: '03',
    title: 'User Roles & Responsibilities',
    body: 'Buyers agree to schedule viewings in good faith. Sellers warrant that all submitted titles (TCT, Deed of Sale, or Tax Declaration) and rental pricing are authentic and accurate. Administrators and Super Administrators enforce compliance and audit trails.',
  },
  {
    id: 'payments',
    num: '04',
    title: 'Payments & Security Deposits',
    body: 'All platform payment invoices and manual GCash/Maya proof records compute base amounts server-side from the approved listing price to prevent tampering.',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <aside className="md:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Contents
              </div>
              <ul className="space-y-2 text-xs font-bold">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-[var(--text-soft)] hover:text-[var(--primary)]">
                      {s.num} &middot; {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="md:col-span-8 space-y-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7">
              <h1 className="text-3xl font-black text-[var(--text)] mb-2">Terms of Service</h1>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Effective Date: January 1, 2026 &middot; Municipality of Sta. Maria, Bulacan
              </p>
              <p className="text-sm text-[var(--text-soft)] leading-relaxed">
                Please read these Terms carefully before using Kasafide. See also our{' '}
                <Link href="/privacy-policy" className="text-[var(--primary)] font-bold underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {SECTIONS.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7"
              >
                <div className="text-xs font-extrabold text-[var(--primary)] mb-1">
                  {s.num} &middot; Section
                </div>
                <h2 className="text-xl font-extrabold text-[var(--text)] mb-2">{s.title}</h2>
                <p className="text-sm text-[var(--text-soft)] leading-relaxed">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
