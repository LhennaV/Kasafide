'use client'

import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react'

type Step = {
  num: string
  label: string
  title: string
  desc: string
  preview: ReactNode
}

function WindowBar({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A8A]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#F4BC5C]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#6FD394]" />
      <span className="ml-2 text-[11px] font-bold text-[var(--text-muted)]">{title}</span>
    </div>
  )
}

const STEPS: Step[] = [
  {
    num: '01',
    label: 'Account',
    title: 'Create an Account',
    desc: 'Sign up as a buyer or seller via email or Google Sign-In. Verify your identity so the person on the other side knows who they are dealing with.',
    preview: (
      <>
        <WindowBar title="Verification" />
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg)]">
            <span className="font-bold text-[var(--text)]">Valid Government ID</span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--success)]/15 text-[var(--success)] font-bold">
              Approved
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg)]">
            <span className="font-bold text-[var(--text)]">Live Camera Selfie</span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--success)]/15 text-[var(--success)] font-bold">
              Verified Seller
            </span>
          </div>
        </div>
      </>
    ),
  },
  {
    num: '02',
    label: 'Discover',
    title: 'Browse or List',
    desc: 'Search by barangay, budget, and property type across Sta. Maria, or post your own titled property and let verified buyers come to you.',
    preview: (
      <>
        <WindowBar title="Browse" />
        <div className="flex flex-wrap gap-1.5 mb-2.5 text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-full bg-[var(--bg)] text-[var(--primary)]">
            Poblacion
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--bg)] text-[var(--text)]">
            Up to ₱20,000
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--bg)] text-[var(--text)]">
            Apartment
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--bg)] flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <div className="font-extrabold text-[var(--text)]">
              2BR Apartment &middot; Poblacion
            </div>
            <div className="text-[var(--text-muted)]">2 beds &middot; 1 bath &middot; 54 sqm</div>
          </div>
          <span className="font-extrabold text-[var(--primary)] whitespace-nowrap">₱12,500/mo</span>
        </div>
      </>
    ),
  },
  {
    num: '03',
    label: 'Connect',
    title: 'Message the Owner',
    desc: 'Talk to the seller inside Kasafide. Arrange a viewing, ask about utilities, and keep the entire thread recorded safely.',
    preview: (
      <>
        <WindowBar title="Messages" />
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[var(--bg)] max-w-[82%] text-[var(--text)]">
            Hi! Is the 2BR unit in Poblacion still open for Saturday viewing?
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-semibold max-w-[82%] ml-auto">
            Yes! Viewing Request Accepted &middot; Sat 10:00 AM
          </div>
        </div>
      </>
    ),
  },
  {
    num: '04',
    label: 'Payment',
    title: 'Pay & Move In',
    desc: 'Pay via QR Ph or upload GCash/Maya proof. The verified landowner confirms receipt and both sides keep an immutable payment record.',
    preview: (
      <>
        <WindowBar title="Payments" />
        <div className="p-2.5 rounded-xl bg-[var(--bg)] flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <div className="font-extrabold text-[var(--text)]">2BR Apartment, Poblacion</div>
            <div className="text-[var(--text-muted)] mt-0.5">GCash &middot; Ref KF-GC-78452</div>
          </div>
          <div className="text-right">
            <div className="font-black text-sm text-[var(--primary)]">₱12,500</div>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[var(--success)]/15 text-[var(--success)] font-bold">
              Confirmed
            </span>
          </div>
        </div>
      </>
    ),
  },
]

// Two-column (zigzag) layout from Tailwind's md breakpoint up; below it the steps stack.
const TWO_COLUMN_QUERY = '(min-width: 768px)'

/**
 * Where an element sits inside an ancestor, by layout rather than by what is on screen.
 * getBoundingClientRect includes transforms (hover lifts, reveal animations), which would put the
 * route off its dots; offsetTop/offsetLeft ignore them.
 */
function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let x = 0
  let y = 0
  for (
    let node: HTMLElement | null = el;
    node && node !== root;
    node = node.offsetParent as HTMLElement | null
  ) {
    x += node.offsetLeft
    y += node.offsetTop
  }
  return { x, y }
}

/**
 * The hand-drawn route between the steps: measured from the real dot positions (steps are as tall
 * as their content, so the dots are not evenly spaced), weaving side to side with a loop hung off
 * every other segment. Redrawn whenever the container resizes.
 */
function useCurvedRoute(
  boxRef: RefObject<HTMLDivElement | null>,
  pathRef: RefObject<SVGPathElement | null>,
) {
  useEffect(() => {
    const box = boxRef.current
    const path = pathRef.current
    const svg = path?.ownerSVGElement
    if (!box || !path || !svg) return

    const twoColumn = window.matchMedia(TWO_COLUMN_QUERY)

    function draw() {
      if (!box || !path || !svg) return
      if (!twoColumn.matches) {
        path.setAttribute('d', '')
        return
      }

      const width = box.offsetWidth
      const height = box.offsetHeight
      const dots = Array.from(box.querySelectorAll<HTMLElement>('[data-tl-dot]')).map((dot) => {
        const at = offsetWithin(dot, box)
        return { x: at.x + dot.offsetWidth / 2, y: at.y + dot.offsetHeight / 2 }
      })
      if (dots.length < 2) return

      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)

      // Everything stays inside the 170px middle lane so the route never slides under a card.
      const swoop = Math.min(78, width * 0.085)
      const radius = Math.min(46, width * 0.043)
      const halfChord = radius * 0.76

      let d = `M ${dots[0].x} ${dots[0].y}`
      for (let i = 1; i < dots.length; i++) {
        const a = dots[i - 1]
        const b = dots[i]
        const dy = b.y - a.y
        const side = i % 2 ? 1 : -1

        if (i % 2) {
          // A loop: into a circle on one side, the long way round, and out the other.
          const loopSide = ((i - 1) / 2) % 2 ? -1 : 1
          const mid = (a.y + b.y) / 2
          const enter = mid - halfChord
          const leave = mid + halfChord
          d += ` C ${a.x + swoop * loopSide * 0.45} ${a.y + dy * 0.26}, ${a.x} ${enter - dy * 0.2}, ${a.x} ${enter}`
          d += ` A ${radius} ${radius} 0 1 ${loopSide > 0 ? 1 : 0} ${a.x} ${leave}`
          d += ` C ${b.x} ${leave + dy * 0.2}, ${b.x + swoop * loopSide * 0.45} ${b.y - dy * 0.26}, ${b.x} ${b.y}`
        } else {
          // A plain swoop between loops; tangents line up so nothing kinks at the dot.
          const reach = dy * 0.42
          d += ` C ${a.x + swoop * side} ${a.y + reach}, ${b.x + swoop * side} ${b.y - reach}, ${b.x} ${b.y}`
        }
      }
      path.setAttribute('d', d)
    }

    draw()

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(draw)
      observer.observe(box)
    } else {
      window.addEventListener('resize', draw)
    }
    twoColumn.addEventListener('change', draw)

    return () => {
      if (observer) observer.disconnect()
      else window.removeEventListener('resize', draw)
      twoColumn.removeEventListener('change', draw)
    }
  }, [boxRef, pathRef])
}

export function HowItWorksTimeline() {
  const boxRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const gradientId = `tl-route-${useId().replace(/:/g, '')}`
  useCurvedRoute(boxRef, pathRef)

  return (
    <div ref={boxRef} className="relative max-w-5xl mx-auto flex flex-col gap-10 md:gap-14">
      {/* The doodle: a dashed route pencilled between the steps (two-column layout only). */}
      <svg
        className="hidden md:block absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'rgb(var(--primary-rgb) / 0)' }} />
            <stop offset="0.09" style={{ stopColor: 'rgb(var(--primary-rgb) / 0.45)' }} />
            <stop offset="0.91" style={{ stopColor: 'rgb(var(--primary-rgb) / 0.45)' }} />
            <stop offset="1" style={{ stopColor: 'rgb(var(--primary-rgb) / 0)' }} />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="6 9"
        />
      </svg>

      {/* On phones the route straightens into a line down the left edge. */}
      <div
        className="md:hidden absolute left-[7px] top-5 bottom-5 w-px bg-gradient-to-b from-transparent via-[var(--primary)]/30 to-transparent"
        aria-hidden="true"
      />

      {STEPS.map((s, i) => {
        const flip = i % 2 === 1
        return (
          <div
            key={s.num}
            className="group relative grid grid-cols-[16px_1fr] gap-x-3.5 items-start md:grid-cols-[1fr_170px_1fr] md:gap-x-0 md:items-center"
          >
            <div
              className={`col-start-2 row-start-2 pt-3.5 md:row-start-1 md:pt-0 ${
                flip ? 'md:col-start-3 md:pl-2' : 'md:col-start-1 md:pr-2'
              }`}
            >
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-md transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--primary)]/40">
                {s.preview}
              </div>
            </div>

            <div
              data-tl-dot
              aria-hidden="true"
              className="relative z-10 col-start-1 row-start-1 mt-1.5 md:mt-0 md:col-start-2 justify-self-center w-[15px] h-[15px] rounded-full border-2 border-[var(--primary)]/50 bg-[var(--bg)] transition duration-200 group-hover:bg-[var(--primary)] group-hover:border-[var(--primary)] group-hover:scale-125"
            />

            <div
              className={`col-start-2 row-start-1 ${
                flip ? 'md:col-start-1 md:pr-2' : 'md:col-start-3 md:pl-2'
              }`}
            >
              <div className="flex items-baseline gap-2.5 mb-2">
                <span className="text-2xl md:text-3xl font-black tracking-tight text-[var(--primary)] leading-none">
                  {s.num}
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)] pl-2.5 border-l border-[var(--border)]">
                  {s.label}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[var(--text)] mb-1.5">{s.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md">{s.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
