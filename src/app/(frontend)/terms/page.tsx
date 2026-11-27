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
    body: 'Payments made through Kasafide are processed by Xendit or recorded through uploaded GCash/Maya proof. The amount is always computed by Kasafide from the approved listing price, never typed in by the payer. Kasafide records the payment and its status; the rental or sale agreement itself is between the buyer/renter and the seller.',
  },
  {
    id: 'listings',
    num: '05',
    title: 'Listing Rules',
    body: 'A listing must describe a real property in Sta. Maria, Bulacan that the seller owns or is authorized to offer, with the seller’s own photos and an accurate price. Administrators may reject, hide, or remove a listing that is misleading, duplicated, reported as fraudulent, or not backed by a valid ownership document.',
  },
  {
    id: 'conduct',
    num: '06',
    title: 'Prohibited Conduct',
    body: 'You may not post false listings or documents, impersonate another person, ask for payment outside the platform to avoid verification, harass other users, upload content you have no right to share, or try to access accounts or data that are not yours. Doing so can lead to suspension of your account and may be reported to the authorities.',
  },
  {
    id: 'google',
    num: '07',
    title: 'Signing In With Google',
    body: 'If you sign in with Google, Kasafide receives only your name, email address, profile picture and Google account identifier, and uses them only to run your Kasafide account, as described in the Privacy Policy. You can disconnect Kasafide from your Google Account settings at any time.',
  },
  {
    id: 'suspension',
    num: '08',
    title: 'Suspension and Account Deletion',
    body: 'Administrators may suspend an account that breaks these Terms. You may stop using Kasafide and ask for your account to be deleted at any time by emailing kasafide.team@gmail.com.',
  },
  {
    id: 'liability',
    num: '09',
    title: 'Limitation of Liability',
    body: 'Kasafide verifies identities and ownership documents to reduce fraud, but it is a listing platform, not a real estate broker, and it is not a party to any lease or sale. Kasafide is provided "as is" as a student capstone project, and to the extent allowed by Philippine law it is not liable for losses arising from agreements between users.',
  },
  {
    id: 'law',
    num: '10',
    title: 'Governing Law and Changes',
    body: 'These Terms are governed by the laws of the Republic of the Philippines. If we change them, we will update the date at the top of this page; continuing to use Kasafide after a change means you accept the updated Terms.',
  },
  {
    id: 'contact',
    num: '11',
    title: 'Contact',
    body: 'Questions about these Terms: kasafide.team@gmail.com · Kasafide Team, Sta. Maria, Bulacan, Philippines.',
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
                Last updated: November 27, 2026 &middot; Municipality of Sta. Maria, Bulacan
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
