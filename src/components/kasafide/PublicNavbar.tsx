'use client'

import { useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authSession, signOutInPlace } from '@/lib/app-session-browser'
import { KasafideLogo } from './KasafideLogo'
import { ThemeToggle } from './ThemeToggle'

const LINKS = [
  { label: 'Home', href: '/', key: 'home' },
  { label: 'Listings', href: '/#featured', key: 'featured' },
  { label: 'How it works', href: '/#how-it-works', key: 'how' },
  { label: 'Browse', href: '/browse', key: 'browse' },
  { label: 'About', href: '/about', key: 'about' },
]

function rolePortalHref(role?: string): string {
  switch (role) {
    case 'seller':
      return '/module/seller'
    case 'admin':
      return '/module/admin'
    case 'superadmin':
    case 'super_duper_admin':
      return '/module/super-admin'
    default:
      return '/module/buyer'
  }
}

export function PublicNavbar({ activePage = 'home' }: { activePage?: string }) {
  const router = useRouter()
  const view = useSyncExternalStore(
    authSession.subscribe,
    authSession.getSnapshot,
    authSession.getServerSnapshot,
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const signedInUser = view.status === 'signed-in' ? view.session.user : null

  return (
    <>
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-20px)] max-w-[1180px]">
        <nav
          aria-label="Primary navigation"
          className="kf-glass-pill h-14 px-3.5 sm:px-5 rounded-full flex items-center justify-between gap-3"
        >
          {/* Brand Logo: CatsTone + Divider + Kasafide Cat-House Mark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-extrabold text-[17px] tracking-tight text-[var(--text)] shrink-0"
          >
            <span className="relative w-7 h-7 rounded-md overflow-hidden shrink-0 hidden sm:inline-flex items-center justify-center">
              <Image
                src="/assets/img/CatsTone Logo.svg"
                alt="CatsTone"
                width={28}
                height={28}
                className="object-contain"
              />
            </span>
            <span className="hidden sm:block w-px h-5 bg-[var(--border)]" />
            <KasafideLogo size={30} />
            <span>Kasafide</span>
          </Link>

          {/* Desktop Center Nav Pills */}
          <div className="hidden md:flex items-center gap-1 bg-[var(--bg)]/45 border border-[var(--border)]/60 rounded-full p-1">
            {LINKS.map((item) => {
              const isActive = item.key === activePage
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition ${
                    isActive
                      ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                      : 'text-[var(--text-soft)] hover:text-[var(--text)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right Actions: Theme + Sign In + Sign Up (or Role Portal) */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="w-9 h-9" />

            {signedInUser ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href={rolePortalHref(signedInUser.role)}
                  className="px-4 py-2 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-bold text-[13px] shadow-md hover:opacity-90 transition"
                >
                  Dashboard ({signedInUser.role === 'super_duper_admin' ? 'Super Admin' : signedInUser.role})
                </Link>
                <button
                  type="button"
                  onClick={() => signOutInPlace(router)}
                  className="px-3.5 py-2 rounded-full border border-[var(--border)] text-[var(--text)] font-semibold text-[12.5px] hover:border-[var(--danger)] hover:text-[var(--danger)] transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-5 py-2 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-bold text-[13px] shadow-md hover:opacity-90 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/70 text-[var(--text)] font-bold text-[13px] hover:border-[var(--primary)] transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Open mobile navigation"
              className="md:hidden w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text)] cursor-pointer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-3xl kf-glass-pill p-4 shadow-2xl">
            <div className="flex flex-col gap-1 mb-3">
              {LINKS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    item.key === activePage
                      ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                      : 'text-[var(--text)] hover:bg-[var(--surface-soft)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
              >
                FAQs
              </Link>
              <Link
                href="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
              >
                Help &amp; Meowrie Assistant
              </Link>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2">
              {signedInUser ? (
                <>
                  <Link
                    href={rolePortalHref(signedInUser.role)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-center font-bold text-sm"
                  >
                    Open {signedInUser.role === 'super_duper_admin' ? 'Super Admin' : signedInUser.role} Portal
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false)
                      await signOutInPlace(router)
                    }}
                    className="w-full py-2.5 rounded-xl border border-[var(--border)] text-[var(--danger)] font-semibold text-sm cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-center font-bold text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-center font-bold text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile App Bottom Bar for Public Discovery */}
      <nav
        aria-label="Mobile quick bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--sidebar-bg)] border-t border-black/20 safe-bottom"
      >
        <div className="grid grid-cols-4 h-[60px] text-[#FBF6F0]">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 text-[10.5px] font-semibold ${
              activePage === 'home' ? 'text-[#FF8A65]' : 'text-white/70'
            }`}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </Link>
          <Link
            href="/browse"
            className={`flex flex-col items-center justify-center gap-1 text-[10.5px] font-semibold ${
              activePage === 'browse' ? 'text-[#FF8A65]' : 'text-white/70'
            }`}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Browse</span>
          </Link>
          <Link
            href="/help"
            className={`flex flex-col items-center justify-center gap-1 text-[10.5px] font-semibold ${
              activePage === 'help' ? 'text-[#FF8A65]' : 'text-white/70'
            }`}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Meowrie</span>
          </Link>
          <Link
            href={signedInUser ? rolePortalHref(signedInUser.role) : '/auth/signin'}
            className="flex flex-col items-center justify-center gap-1 text-[10.5px] font-semibold text-white/80"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{signedInUser ? 'Portal' : 'Sign In'}</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
