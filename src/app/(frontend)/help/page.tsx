import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { MeowrieAssistant } from '@/components/kasafide/MeowrieAssistant'
import { PublicFooter } from '@/components/kasafide/PublicFooter'

export const metadata: Metadata = {
  title: 'Kasafide – Help & Support',
  description: 'Get instant answers from Meowrie, our support assistant.',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar activePage="help" />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-[var(--text)]">Help &amp; Support</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Get quick answers from Meowrie, our Kasafide cat assistant, or explore verification and payment guides.
          </p>
        </div>
        <MeowrieAssistant />
      </main>
      <PublicFooter />
    </div>
  )
}
