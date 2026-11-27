import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { PublicFooter } from '@/components/kasafide/PublicFooter'
import { PolicyToc } from '../_policy/PolicyToc'
import { PRIVACY_HTML } from '../_policy/privacy-html'
import '../_policy/policy.css'

export const metadata: Metadata = {
  title: 'Kasafide – Privacy Policy',
  description:
    'How Kasafide collects, uses, stores, shares and deletes personal data, including data received through Sign in with Google.',
}

/*
 * The original Kasafide Privacy Policy page, restored, plus the "Information We Receive From
 * Google" section that Google's OAuth consent-screen review checks for. Keep this page public,
 * on the same domain as the home page, and linked from the footer.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <PublicNavbar />
      {/* Static markup we wrote ourselves (see _policy/privacy-html.ts), not user content. */}
      <main className="kf-policy flex-1" dangerouslySetInnerHTML={{ __html: `<div class="policy-main">${PRIVACY_HTML}</div>` }} />
      <PolicyToc />
      <PublicFooter />
    </div>
  )
}
