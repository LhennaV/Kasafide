import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { PublicFooter } from '@/components/kasafide/PublicFooter'
import { PolicyToc } from '../_policy/PolicyToc'
import { TERMS_HTML } from '../_policy/terms-html'
import '../_policy/policy.css'

export const metadata: Metadata = {
  title: 'Kasafide – Terms of Service',
}

/** The original Kasafide Terms page (layout, contents sidebar, callouts), restored. */
export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <PublicNavbar />
      {/* Static markup we wrote ourselves (see _policy/terms-html.ts), not user content. */}
      <main className="kf-policy flex-1" dangerouslySetInnerHTML={{ __html: `<div class="policy-main">${TERMS_HTML}</div>` }} />
      <PolicyToc />
      <PublicFooter />
    </div>
  )
}
