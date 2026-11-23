'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { authSession, signOutInPlace } from '@/lib/app-session-browser'
import { KasafideLogo } from './KasafideLogo'

// `key` is the landing-page section the link belongs to ('top' = the hero).
const LINKS = [
  { label: 'Home', href: '/', key: 'top' },
  { label: 'Listings', href: '/#featured', key: 'featured' },
  { label: 'How it works', href: '/#how-it-works', key: 'how-it-works' },
]

// Sections the highlight follows on the landing page. Listings stays lit through Browse by Type
// and the map, How it works until the Browse section; past that nothing in the bar is lit.
const SPY_SECTIONS = ['featured', 'how-it-works', 'browse']

/** Which landing section is under the top third of the screen, re-checked once per frame. */
function useScrollSection(enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(enabled ? 'top' : null)
  useEffect(() => {
    if (!enabled) {
      setActive(null)
      return
    }
    let queued = false
    const update = () => {
      queued = false
      const line = window.innerHeight * 0.35
      let cur = 'top'
      for (const id of SPY_SECTIONS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) cur = id
      }
      setActive(cur)
    }
    const onScroll = () => {
      if (!queued) {
        queued = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [enabled])
  return active
}

/**
 * The links sit straight on the glass bar (no box of their own), with one soft pill behind them
 * that slides to the section you scroll into, to the link under the pointer while hovering, and
 * back when the pointer leaves.
 */
function NavLinks() {
  const pathname = usePathname()
  const active = useScrollSection(pathname === '/')
  const boxRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)
  const target = hover ?? active

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const measure = () => {
      const a = target ? box.querySelector<HTMLElement>(`[data-key="${target}"]`) : null
      setPill(a ? { x: a.offsetLeft, w: a.offsetWidth } : null)
    }
    measure()
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
    ro?.observe(box)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => ro?.disconnect()
  }, [target])

  return (
    <div
      ref={boxRef}
      className="hidden lg:flex relative items-center gap-1"
      onMouseLeave={() => setHover(null)}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 h-8 -mt-4 rounded-full bg-[var(--primary)]/15 shadow-[inset_0_0_0_1px_rgb(var(--primary-rgb)/0.28)] pointer-events-none transition-[transform,width,opacity] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-opacity"
        style={
          pill
            ? { transform: `translateX(${pill.x}px)`, width: `${pill.w}px`, opacity: 1 }
            : { opacity: 0 }
        }
      />
      {LINKS.map((item) => {
        const on = item.key === active
        const lit = item.key === target
        return (
          <Link
            key={item.key}
            href={item.href}
            data-key={item.key}
            aria-current={on ? 'location' : undefined}
            onMouseEnter={() => setHover(item.key)}
            onFocus={() => setHover(item.key)}
            onBlur={() => setHover(null)}
            className={`relative z-[1] px-3.5 py-[7px] rounded-full text-[13.5px] whitespace-nowrap transition-colors duration-300 ${
              lit ? 'text-[var(--text)]' : 'text-[var(--text-soft)]'
            } ${on ? 'font-bold' : 'font-semibold'}`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

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

          <NavLinks />

          {/* Right Actions: Theme + Demo Roles + Sign In + Sign Up (or Role Portal) */}
          <div className="flex items-center gap-2">
            {/* Quick Demo Preview Button */}
            <div className="relative group">
              <button
                type="button"
                className="px-3 py-1.5 rounded-full border border-[var(--primary)]/60 bg-[var(--primary)]/15 text-[var(--primary)] font-extrabold text-[12px] flex items-center gap-1.5 hover:bg-[var(--primary)] hover:text-[var(--on-primary)] transition cursor-pointer"
              >
                <span>⚡ Demo Preview</span>
                <span className="text-[9px]">▼</span>
              </button>
              <div className="hidden group-hover:block absolute right-0 top-full pt-1.5 z-50 min-w-[200px]">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-2 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                    No login needed · Instant Roles
                  </div>
                  <Link
                    href="/api/app-auth/demo?role=buyer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text)] hover:bg-[var(--surface-soft)] hover:text-[var(--primary)] transition"
                  >
                    <span>👤</span>
                    <span>Buyer / Renter</span>
                  </Link>
                  <Link
                    href="/api/app-auth/demo?role=seller"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text)] hover:bg-[var(--surface-soft)] hover:text-[var(--primary)] transition"
                  >
                    <span>🏡</span>
                    <span>Verified Seller</span>
                  </Link>
                  <Link
                    href="/api/app-auth/demo?role=admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text)] hover:bg-[var(--surface-soft)] hover:text-[var(--primary)] transition"
                  >
                    <span>🛡️</span>
                    <span>Admin Moderator</span>
                  </Link>
                  <Link
                    href="/api/app-auth/demo?role=superadmin"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text)] hover:bg-[var(--surface-soft)] hover:text-[var(--primary)] transition"
                  >
                    <span>⚡</span>
                    <span>Super Admin</span>
                  </Link>
                </div>
              </div>
            </div>

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
              className="lg:hidden w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text)] cursor-pointer"
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
          <div className="lg:hidden mt-2 rounded-3xl kf-glass-pill p-4 shadow-2xl">
            <div className="flex flex-col gap-1 mb-3">
              {LINKS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    item.key === (activePage === 'home' ? 'top' : activePage)
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
              <div className="rounded-2xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 p-3 mb-1">
                <div className="text-[11px] font-extrabold uppercase text-[var(--primary)] mb-2 flex items-center gap-1">
                  <span>⚡ Instant Demo Role Preview</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                  <Link
                    href="/api/app-auth/demo?role=buyer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-[var(--surface)] text-center border border-[var(--border)]"
                  >
                    👤 Buyer
                  </Link>
                  <Link
                    href="/api/app-auth/demo?role=seller"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-[var(--surface)] text-center border border-[var(--border)]"
                  >
                    🏡 Seller
                  </Link>
                  <Link
                    href="/api/app-auth/demo?role=admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-[var(--surface)] text-center border border-[var(--border)]"
                  >
                    🛡️ Admin
                  </Link>
                  <Link
                    href="/api/app-auth/demo?role=superadmin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-[var(--surface)] text-center border border-[var(--border)]"
                  >
                    ⚡ Super Admin
                  </Link>
                </div>
              </div>

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
