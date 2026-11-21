import Link from 'next/link'
import { KasafideLogo } from './KasafideLogo'

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]/80 pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 font-extrabold text-lg text-[var(--text)] mb-3">
              <KasafideLogo size={28} />
              <span>Kasafide</span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              A verified housing platform for secure property rentals and purchases across all 24 barangays of Sta. Maria, Bulacan.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text)] mb-3.5">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li>
                <Link href="/browse" className="hover:text-[var(--primary)] transition">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/auth/signup?role=seller" className="hover:text-[var(--primary)] transition">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--primary)] transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text)] mb-3.5">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li>
                <Link href="/help" className="hover:text-[var(--primary)] transition">
                  Help &amp; Support (Meowrie)
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-[var(--primary)] transition">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text)] mb-3.5">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li>
                <Link href="/privacy-policy" className="hover:text-[var(--primary)] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--primary)] transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <span>&copy; 2026 Kasafide. All rights reserved.</span>
          <span>Municipality of Sta. Maria, Bulacan, Philippines</span>
        </div>
      </div>
    </footer>
  )
}
