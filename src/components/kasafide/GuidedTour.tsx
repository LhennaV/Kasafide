'use client'

/**
 * First-time guided tour: dims the page, cuts a spotlight around the real button or section,
 * and puts a short note next to it ("tap here to…"). Steps can live on other pages; the tour
 * navigates there and waits for the element. Elements are found by `data-tour="…"` attributes
 * (PortalShell nav items, Payout Settings, Request Payment, Meowrie's live-agent button, …).
 *
 * Progress is kept in sessionStorage so it survives the page change between steps. Finishing or
 * skipping saves `onboardingCompletedAt`, after which the tour only opens from the profile menu.
 */

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { completeOnboardingAction } from '@/app/actions/portal'
import type { PortalUserSummary } from '@/lib/portal-guard'

type Step = {
  /** Page the step is on. */
  path: string
  /** data-tour targets, first visible one wins (so a desktop sidebar item falls back to the phone nav). */
  targets: string[]
  title: string
  body: string
  /** Wording when a fallback target is the one on screen (e.g. the nav, not the button itself). */
  alt?: Record<string, string>
}

const BUYER: Step[] = [
  {
    path: '/module/buyer',
    targets: ['browse-filters', 'nav-dashboard'],
    title: 'Find a home here',
    body: 'Filter every admin-approved property in Sta. Maria by barangay, type and price, then open one to see photos and details.',
    alt: { 'nav-dashboard': 'Your dashboard lists every admin-approved property in Sta. Maria. Filter by barangay, type and price, then open one to see photos and details.' },
  },
  {
    path: '/module/buyer',
    targets: ['save-heart', 'nav-saved', 'nav-more'],
    title: 'Save places you like',
    body: 'Tap this heart to save a listing. Saved ones are kept under “Saved Listings” so you can compare later.',
    alt: {
      'nav-saved': 'Tap the heart on any listing and it lands here, so you can compare later.',
      'nav-more': 'Tap the heart on any listing; your saved ones are under More → Saved Listings.',
    },
  },
  {
    path: '/module/buyer/verification',
    targets: ['verify-form'],
    title: 'Verify your identity',
    body: 'Upload a government ID and take a live selfie here; an admin checks it and you get the verified badge. You can come back from the profile menu → “Get Verified”.',
  },
  {
    path: '/module/buyer/messages',
    targets: ['nav-messages'],
    title: 'Chat with sellers',
    body: 'On any listing tap “Message Seller”. Your conversations and viewing requests appear here. No phone numbers needed.',
  },
  {
    path: '/module/buyer/messages',
    targets: ['support-thread'],
    title: 'Talk to a real person',
    body: 'Stuck? Write here and a Kasafide admin (live agent) replies in this chat.',
  },
  {
    path: '/module/buyer/payments',
    targets: ['tab-topay', 'nav-payments', 'nav-more'],
    title: 'Paying a seller',
    body: 'Payment requests from sellers wait here under “To Pay” (and as a card in your chat). Tap “Pay now”, choose E-Wallet or Bank, send the amount and enter your reference number.',
  },
  {
    path: '/module/buyer/payments',
    targets: ['tab-history', 'payment-tabs'],
    title: 'Purchase History',
    body: 'Every confirmed, rejected or refunded payment is kept here. “Waiting for Seller” (beside it) shows payments sent but not yet confirmed.',
  },
  {
    path: '/module/buyer/profile',
    targets: ['upgrade-seller'],
    title: 'Want to sell or rent out?',
    body: 'Tap “Upgrade to Seller” anytime. Same account, your messages and payments stay.',
  },
  {
    path: '/module/buyer/help',
    targets: ['live-agent'],
    title: 'Ask Meowrie',
    body: 'Meowrie answers common questions instantly. If she can’t, tap “Live agent” to reach an admin. You can replay this tour from your profile menu.',
  },
]

const SELLER: Step[] = [
  {
    path: '/module/seller/verification',
    targets: ['verify-form'],
    title: 'Step 1: verify your identity',
    body: 'Upload a government ID and a live selfie here. Only verified sellers can have listings go live. Later: profile menu → “Get Verified”.',
  },
  {
    path: '/module/seller/moa',
    targets: ['moa-sign', 'moa-doc'],
    title: 'Step 2: sign the MOA',
    body: 'After reading the agreement above, tick this box, type your full name and tap Sign. It’s required before posting.',
    alt: { 'moa-doc': 'This is your signed Memorandum of Agreement. It’s required before posting, and you’ve already signed it.' },
  },
  {
    path: '/module/seller/payments',
    targets: ['payout-settings'],
    title: 'Step 3: Payout Settings',
    body: 'Turn on E-Wallet (GCash, Maya, ShopeePay…) and/or Bank Transfer, fill in the account and save (later: “Edit payout settings”). Buyers see these only when they pay a request you sent.',
  },
  {
    path: '/module/seller/post',
    targets: ['nav-post', 'nav-more'],
    title: 'Step 4: post a property',
    body: 'Tap here to post. Add details, clear photos (the first is the cover) and your ownership document (TCT, Deed of Sale or Tax Declaration).',
  },
  {
    path: '/module/seller/post',
    targets: ['post-submit', 'post-form'],
    title: 'Submit for admin review',
    body: 'When everything is filled in, tap this button. An admin checks your title and photos, and you’ll get a notification when it’s approved and public.',
    alt: { 'post-form': 'Sign the MOA first, then the posting form appears here. An admin reviews every listing before it goes public.' },
  },
  {
    path: '/module/seller/messages',
    targets: ['request-payment', 'nav-messages'],
    title: 'Request payment in the chat',
    body: 'Tap “+ Request Payment”, pick what it’s for and the amount. The buyer gets a card with a “Pay now” button.',
    alt: { 'nav-messages': 'Open a buyer’s chat here, then tap “+ Request Payment” at the top of the conversation. The buyer gets a card with a “Pay now” button.' },
  },
  {
    path: '/module/seller/payments',
    targets: ['tab-confirm', 'payment-tabs'],
    title: 'Confirm payments',
    body: 'Buyer payments land in “To Confirm”. Check your e-wallet or bank, then tap Confirm on the payment. Everything is kept in Payment History.',
  },
  {
    path: '/module/seller/listings',
    targets: ['nav-listings'],
    title: 'Manage your listings',
    body: 'See pending, live and closed listings here, and close one or lower available units once it’s rented or sold.',
  },
  {
    path: '/module/seller/help',
    targets: ['live-agent'],
    title: 'Need help?',
    body: 'Ask Meowrie, or tap “Live agent” to reach a Kasafide admin. Replay this tour anytime from your profile menu.',
  },
]

const ADMIN: Step[] = [
  {
    path: '/module/admin',
    targets: ['nav-users'],
    title: 'Review users',
    body: 'See each member’s ID photo and live selfie. Approve, reject with a reason, or suspend.',
  },
  {
    path: '/module/admin',
    targets: ['nav-listings'],
    title: 'Review listings',
    body: 'Pending listings come with photos and the ownership document. Approve to publish or reject with a reason.',
  },
  {
    path: '/module/admin/support',
    targets: ['nav-support', 'nav-more'],
    title: 'Answer Live Support',
    body: 'Questions Meowrie couldn’t answer arrive here. Any admin can reply; the member sees it in their Messages.',
  },
  {
    path: '/module/admin',
    targets: ['nav-payments', 'nav-more'],
    title: 'Payments & reports',
    body: 'Every transaction on the platform, plus listings members reported as suspicious under Reports.',
  },
]

const SUPER_ADMIN: Step[] = [
  {
    path: '/module/super-admin',
    targets: ['nav-admins'],
    title: 'Manage admins',
    body: 'Create and manage administrator accounts here.',
  },
  {
    path: '/module/super-admin',
    targets: ['nav-audit-trail'],
    title: 'Audit trail',
    body: 'Every approval, rejection and account change, with who did it and when.',
  },
  {
    path: '/module/super-admin/support',
    targets: ['nav-support', 'nav-more'],
    title: 'Live Support',
    body: 'Member questions Meowrie couldn’t answer. Reply here; they see it in their Messages.',
  },
]

function stepsFor(role: PortalUserSummary['role']): Step[] {
  if (role === 'seller') return SELLER
  if (role === 'buyer') return BUYER
  if (role === 'admin') return ADMIN
  return SUPER_ADMIN
}

const KEY = 'kf-tour'
const DONE = 'kf-guide-done'

type Saved = { role: string; i: number }

function readSaved(): Saved | null {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}

/** Starts the tour from step 1 (used by the profile menu's "Kasafide Guide"). */
export function startGuidedTour(role: string) {
  sessionStorage.setItem(KEY, JSON.stringify({ role, i: 0 } satisfies Saved))
  window.dispatchEvent(new Event('kf-tour-start'))
}

function visible(el: Element) {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
}

function findTarget(names: string[]): { el: HTMLElement; name: string } | null {
  for (const name of names) {
    const el = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)).find(visible)
    if (el) return { el, name }
  }
  return null
}

type Box = { top: number; left: number; width: number; height: number }

export function GuidedTour({ user }: { user: PortalUserSummary }) {
  const router = useRouter()
  const pathname = usePathname()
  const steps = stepsFor(user.role)
  const [i, setI] = useState<number | null>(null)
  const [box, setBox] = useState<Box | null>(null)
  const [missing, setMissing] = useState(false)
  const [hit, setHit] = useState('')

  // Decide whether the tour is running (resume, auto-start for new accounts, or menu restart).
  useEffect(() => {
    function load() {
      const saved = readSaved()
      if (saved && saved.role === user.role) setI(Math.min(saved.i, steps.length - 1))
      else if (!user.onboardingCompletedAt && !sessionStorage.getItem(DONE)) {
        sessionStorage.setItem(KEY, JSON.stringify({ role: user.role, i: 0 }))
        setI(0)
      }
    }
    load()
    window.addEventListener('kf-tour-start', load)
    return () => window.removeEventListener('kf-tour-start', load)
  }, [user.role, user.onboardingCompletedAt, steps.length])

  const step = i === null ? null : steps[i]

  // Go to the step's page.
  useEffect(() => {
    if (step && pathname !== step.path) router.push(step.path)
  }, [step, pathname, router])

  // Find the element (it may render a moment after navigation), scroll to it, keep the box in sync.
  useLayoutEffect(() => {
    setBox(null)
    setMissing(false)
    if (!step || pathname !== step.path) return
    let el: HTMLElement | null = null
    let tries = 0
    let raf = 0
    const measure = () => {
      if (!el) return
      const r = el.getBoundingClientRect()
      setBox({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    const poll = window.setInterval(() => {
      const found = findTarget(step.targets)
      el = found?.el ?? null
      tries++
      if (found) {
        setHit(found.name)
        window.clearInterval(poll)
        found.el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        // Measure again while the smooth scroll settles.
        const until = Date.now() + 700
        const loop = () => {
          measure()
          if (Date.now() < until) raf = requestAnimationFrame(loop)
        }
        loop()
      } else if (tries > 40) {
        window.clearInterval(poll)
        setMissing(true)
      }
    }, 100)
    const onMove = () => measure()
    window.addEventListener('resize', onMove)
    window.addEventListener('scroll', onMove, true)
    return () => {
      window.clearInterval(poll)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [step, pathname])

  const go = useCallback(
    (next: number) => {
      sessionStorage.setItem(KEY, JSON.stringify({ role: user.role, i: next }))
      setI(next)
    },
    [user.role],
  )

  const finish = useCallback(() => {
    sessionStorage.removeItem(KEY)
    sessionStorage.setItem(DONE, '1')
    setI(null)
    if (!user.onboardingCompletedAt) void completeOnboardingAction().catch(() => null)
  }, [user.onboardingCompletedAt])

  useEffect(() => {
    if (i === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      if (e.key === 'ArrowRight') i < steps.length - 1 ? go(i + 1) : finish()
      if (e.key === 'ArrowLeft' && i > 0) go(i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [i, steps.length, go, finish])

  if (!step || i === null) return null
  // Element not on screen yet: a transparent blocker only, so nothing flashes.
  if (!box && !missing) return <div className="fixed inset-0 z-[70]" />

  const PAD = 8
  const hole = box
    ? { top: box.top - PAD, left: box.left - PAD, width: box.width + PAD * 2, height: box.height + PAD * 2 }
    : null

  // Note placement: right of narrow sidebar items, otherwise below (or above if no room).
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const NOTE_W = Math.min(340, vw - 24)
  let noteStyle: React.CSSProperties
  let arrow: 'left' | 'top' | 'bottom' | null = null
  if (!hole) {
    noteStyle = { top: vh / 2 - 100, left: (vw - NOTE_W) / 2 }
  } else if (hole.left + hole.width < 120 && vw > 640) {
    noteStyle = { top: Math.max(12, Math.min(hole.top, vh - 260)), left: hole.left + hole.width + 16 }
    arrow = 'left'
  } else if (hole.top + hole.height + 230 < vh) {
    noteStyle = {
      top: hole.top + hole.height + 14,
      left: Math.max(12, Math.min(hole.left + hole.width / 2 - NOTE_W / 2, vw - NOTE_W - 12)),
    }
    arrow = 'top'
  } else {
    noteStyle = {
      top: Math.max(12, hole.top - 14 - 220),
      left: Math.max(12, Math.min(hole.left + hole.width / 2 - NOTE_W / 2, vw - NOTE_W - 12)),
    }
    arrow = 'bottom'
  }
  const last = i === steps.length - 1

  return (
    <div className="fixed inset-0 z-[70]" aria-live="polite">
      {/* Dim everything except the hole; the hole itself blocks clicks too, the note drives the tour. */}
      {hole ? (
        <div
          className="kf-tour-hole absolute rounded-2xl transition-all duration-300 ease-out"
          style={{ ...hole, boxShadow: '0 0 0 9999px rgba(20, 10, 30, 0.68)' }}
        >
          <span className="absolute inset-0 rounded-2xl ring-2 ring-[#FF8A65] animate-pulse" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[rgba(20,10,30,0.68)]" />
      )}

      <div
        role="dialog"
        aria-label={step.title}
        className="absolute rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-4 transition-all duration-300"
        style={{ ...noteStyle, width: NOTE_W }}
      >
        {arrow === 'left' && (
          <span className="absolute -left-2 top-5 w-4 h-4 rotate-45 bg-[var(--surface)] border-l border-b border-[var(--border)]" />
        )}
        {arrow === 'top' && (
          <span className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 rotate-45 bg-[var(--surface)] border-l border-t border-[var(--border)]" />
        )}
        {arrow === 'bottom' && (
          <span className="absolute -bottom-2 left-1/2 -ml-2 w-4 h-4 rotate-45 bg-[var(--surface)] border-r border-b border-[var(--border)]" />
        )}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#FF8A65]">
            {i + 1} / {steps.length}
          </span>
          <button
            type="button"
            onClick={finish}
            className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
          >
            Skip tour
          </button>
        </div>
        <div className="font-black text-[15px] text-[var(--text)] mb-1">{step.title}</div>
        <p className="text-[13px] leading-relaxed text-[var(--text-soft)]">{step.alt?.[hit] ?? step.body}</p>
        <div className="flex items-center justify-end gap-2 mt-3">
          {i > 0 && (
            <button
              type="button"
              onClick={() => go(i - 1)}
              className="px-3.5 py-2 rounded-xl border border-[var(--border)] text-xs font-extrabold cursor-pointer"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? finish() : go(i + 1))}
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold cursor-pointer"
          >
            {last ? 'Done' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
