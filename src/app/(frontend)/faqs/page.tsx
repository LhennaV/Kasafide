import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { PublicFooter } from '@/components/kasafide/PublicFooter'
import { FaqsClient } from './FaqsClient'

export const metadata: Metadata = {
  title: 'Kasafide – Frequently Asked Questions',
}

export default function FaqsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar activePage="faqs" />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--primary)]">
            Support Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text)] mt-1">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Everything you need to know about verified rentals and property sales in Sta. Maria.
          </p>
        </div>
        <FaqsClient />
      </main>
      <PublicFooter />
    </div>
  )
}
