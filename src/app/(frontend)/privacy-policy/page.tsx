import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { PublicFooter } from '@/components/kasafide/PublicFooter'

export const metadata: Metadata = {
  title: 'Kasafide – Privacy Policy',
  description:
    'How Kasafide collects, uses, stores, shares and deletes personal data, including data received through Sign in with Google.',
}

const CONTACT_EMAIL = 'kasafide.team@gmail.com'
const UPDATED = 'November 27, 2026'

type Item = { id: string; title: string; paragraphs?: string[]; bullets?: string[] }

/*
 * Written to cover what Google's OAuth consent-screen review checks for: which Google user data
 * the app receives, how it is used, stored, shared and deleted, and how to reach the developer.
 * Keep this page public, on the same domain as the home page, and linked from the footer.
 */
const ITEMS: Item[] = [
  {
    id: 'who',
    title: 'Who We Are',
    paragraphs: [
      'Kasafide is a property listing and rental platform for the Municipality of Sta. Maria, Bulacan, Philippines, built as a student capstone project. It helps buyers and renters find verified listings and helps landowners list property after their identity and ownership documents are checked by an administrator.',
      `This policy explains what personal data Kasafide collects, why, and what you can do about it. If you have any question, email us at ${CONTACT_EMAIL}.`,
    ],
  },
  {
    id: 'collect',
    title: 'Information We Collect',
    bullets: [
      'Account details you give us: first name, middle initial, last name, email address, password (stored only as a one-way hash), phone number, short bio, and your chosen role (buyer/renter or seller).',
      'Seller payout details you choose to add: GCash and Maya numbers.',
      'Identity verification: the type of government ID, the last 4 digits of its number, a photo of the ID, and a live selfie taken with your device camera inside the app.',
      'Property information sellers submit: listing details, property photos, and a scan or photo of the ownership document (title, deed of sale, or tax declaration).',
      'Activity on the platform: saved listings, messages between buyers and sellers, viewing requests, reviews, reports, payment records, and notifications.',
      'Profile photo, if you upload one.',
    ],
  },
  {
    id: 'google',
    title: 'Information We Receive From Google',
    paragraphs: [
      'If you choose "Sign in with Google", Google shares the following with Kasafide, and only after you approve it on Google’s consent screen: your name, your email address, your Google profile picture, and a unique Google account identifier. Kasafide only requests the basic "openid", "email" and "profile" permissions. We do not request access to your Gmail, Google Drive, Contacts, Calendar, or any other Google service.',
      'We use this information only to create your Kasafide account or sign you in to it, to fill in your name and profile picture, and to contact you about your account. We do not use Google user data for advertising, we do not sell it, and we do not transfer it to anyone except as described under "Who We Share Data With" below.',
      'Kasafide’s use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.',
    ],
  },
  {
    id: 'use',
    title: 'How We Use Your Information',
    bullets: [
      'To create and secure your account and keep you signed in.',
      'To let administrators verify your identity and, for sellers, the ownership of a listed property before it is published.',
      'To show your listings, messages, viewing requests and reviews to the people they are meant for.',
      'To process rent or reservation payments and record their status.',
      'To send you notifications and account emails (for example, email confirmation and password reset).',
      'To detect and act on fraud, fake listings, and reports from other users.',
    ],
  },
  {
    id: 'share',
    title: 'Who We Share Data With',
    paragraphs: [
      'We never sell personal data. We share it only in these cases:',
    ],
    bullets: [
      'With other users, only what a listing or conversation needs: a seller’s name and listing details are shown on the listing; messages are visible to the two people in the conversation.',
      'With Kasafide administrators, who review identity and ownership documents. These documents are never shown to other users or to the public.',
      'With service providers that run the platform for us: Supabase (database, sign-in and file storage), Netlify (website hosting), Google (Sign in with Google), Xendit (payment processing), and our email provider (account emails). They process the data only to provide their service to Kasafide.',
      'When the law requires it, for example a valid order from a Philippine court or government authority.',
    ],
  },
  {
    id: 'store',
    title: 'How We Store and Protect Data',
    bullets: [
      'Data is stored in a managed database and file storage service (Supabase) over encrypted connections (HTTPS).',
      'ID photos, selfies and ownership documents are kept in private storage. They can only be opened through short-lived links (about 10 minutes) created for the account owner or an administrator.',
      'Passwords are stored as one-way hashes; nobody at Kasafide can read them.',
      'Access rules in the database decide what each signed-in user may read or change.',
    ],
  },
  {
    id: 'retention',
    title: 'How Long We Keep Data, and Deleting It',
    paragraphs: [
      'We keep your account data while your account is active. Verification documents are kept while your verification is valid and for as long as a listing that relied on them is active, so that a dispute can still be checked.',
      `You can ask us to delete your account and all of its data, including any data received from Google, at any time by emailing ${CONTACT_EMAIL} from the email address on the account. We will confirm and complete the deletion within 30 days, except for payment records we are required by law to keep.`,
      'You can also remove Kasafide’s access to your Google account at any time from your Google Account settings (Security → Third-party apps with account access).',
    ],
  },
  {
    id: 'rights',
    title: 'Your Rights Under the Data Privacy Act of 2012 (RA 10173)',
    paragraphs: [
      'You have the right to be informed, to access, to correct, to object, to erasure or blocking, to data portability, and to file a complaint with the National Privacy Commission. You can update most details yourself in Account Settings; for anything else, email us.',
    ],
  },
  {
    id: 'children',
    title: 'Children',
    paragraphs: [
      'Kasafide is meant for adults who can enter into property transactions. We do not knowingly collect data from anyone under 18.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    paragraphs: [
      'If we change this policy we will update the date at the top of this page, and for important changes we will notify signed-in users in the app.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    paragraphs: [
      `Kasafide Team · Sta. Maria, Bulacan, Philippines · ${CONTACT_EMAIL}`,
    ],
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
            Last updated: {UPDATED} &middot; Compliant with Republic Act No. 10173 (Data Privacy Act of
            2012)
          </p>
          <p className="text-sm text-[var(--text-soft)] mt-4 leading-relaxed">
            See also our{' '}
            <Link href="/terms" className="text-[var(--primary)] font-bold underline">
              Terms of Service
            </Link>
            .
          </p>
          <nav aria-label="Contents" className="mt-4 flex flex-wrap gap-2">
            {ITEMS.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-2.5 py-1 rounded-full bg-[var(--surface-soft)] text-[11px] font-bold text-[var(--text-soft)] hover:text-[var(--primary)]"
              >
                {String(i + 1).padStart(2, '0')} {item.title}
              </a>
            ))}
          </nav>
        </div>
        <div className="space-y-5">
          {ITEMS.map((item, i) => (
            <section
              key={item.id}
              id={item.id}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 scroll-mt-24"
            >
              <div className="text-xs font-extrabold text-[var(--primary)] mb-1">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h2 className="text-xl font-extrabold text-[var(--text)] mb-3">{item.title}</h2>
              <div className="space-y-3 text-sm text-[var(--text-soft)] leading-relaxed">
                {item.paragraphs?.map((p) => <p key={p}>{p}</p>)}
                {item.bullets && (
                  <ul className="list-disc pl-5 space-y-1.5">
                    {item.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
