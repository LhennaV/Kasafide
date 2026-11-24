'use client'

// The landing page from LhennaV/Kasafide (public/index.html + assets/js/index.js), ported to TSX
// one section at a time with the same markup and class names, so landing.css (the original
// index.css + responsive.css, scoped under .kf-landing) styles it exactly as before.

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type RefObject } from 'react'
import { KasafideLogo } from '../KasafideLogo'
import type { BarangayPinView, ListingCardView } from '@/lib/kasafide-data'
import './landing.css'

// ── Shapes ─────────────────────────────────────────────────────────────────────

type Card = {
  id: string
  href: string
  title: string
  price: string
  period: string
  location: string
  barangay: string
  beds: number
  baths: number
  badge: string
  badgeType: string
  verified: boolean
  image: string
}

const PLACEHOLDER = '/assets/img/house_image.jpg'
const NEW_WITHIN_DAYS = 14

function toCard(l: ListingCardView): Card {
  const rent = l.listingType === 'rent'
  const isNew = l.createdAt && Date.now() - new Date(l.createdAt).getTime() < NEW_WITHIN_DAYS * 86400000
  return {
    id: l.id,
    href: `/listings/${l.slug}`,
    title: l.title,
    price: l.priceFormatted,
    period: l.periodLabel,
    location: [l.barangayName, l.city || 'Sta. Maria'].filter(Boolean).join(', '),
    barangay: l.barangayName,
    beds: l.bedrooms || 0,
    baths: l.bathrooms || 0,
    badge: isNew ? 'New' : rent ? 'For Rent' : 'For Sale',
    badgeType: isNew ? 'new' : rent ? 'rent' : 'sale',
    verified: l.sellerVerified,
    image: l.coverUrl || PLACEHOLDER,
  }
}

function Svg({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

function onEnter(open: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open()
    }
  }
}

// ── Data ───────────────────────────────────────────────────────────────────────

const categories = [
  { name: 'Houses', type: 'house', fallbacks: ['/assets/img/types/house.jpg', '/assets/img/house_image.jpg'] },
  { name: 'Apartments', type: 'apartment', fallbacks: ['/assets/img/types/apartment.jpg'] },
  { name: 'Lots & Land', type: 'lot', fallbacks: ['/assets/img/types/lot.jpg'] },
]

const steps = [
  {
    num: '01',
    label: 'Account',
    title: 'Create an Account',
    desc: 'Sign up as a buyer or seller. Verify your identity so the person on the other side knows who they are dealing with.',
    screen: 'verification',
  },
  {
    num: '02',
    label: 'Discover',
    title: 'Browse or List',
    desc: 'Search by barangay, budget and property type across Sta. Maria — or post your own listing and let buyers come to you.',
    screen: 'listing',
  },
  {
    num: '03',
    label: 'Connect',
    title: 'Message the Owner',
    desc: 'Talk to the seller inside Kasafide. Arrange a viewing, ask about the place, and keep the whole conversation in one thread.',
    screen: 'messages',
  },
  {
    num: '04',
    label: 'Payment',
    title: 'Pay and Move In',
    desc: 'Pay through the platform or upload proof of a direct payment. The seller confirms it, and both of you keep a record.',
    screen: 'payment',
  },
]

const whyFeatures = [
  {
    title: 'Verified Sellers',
    desc: 'All property owners undergo identity verification with government ID and selfie before publishing listings.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    title: 'Local Focus',
    desc: 'Find properties by barangay within Sta. Maria, Bulacan with easy filtering options.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  },
  {
    title: 'Direct Messaging',
    desc: 'Connect directly with verified sellers through our secure in-platform messaging system.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  },
]

// ── Icons ──────────────────────────────────────────────────────────────────────

const pinIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--text-muted)"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
const checkIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" style="stroke:var(--on-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
const chevronLeft = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`
const chevronRight = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`
const shieldIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
const bedIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`
const bathIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`
const heroTypeIcons: Record<string, string> = {
  house: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/></svg>`,
  apartment: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>`,
  lot: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3z"/><path d="M9 4v13M15 7v13"/></svg>`,
}
const heroArrowIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`

// ── Shared behaviour ───────────────────────────────────────────────────────────

function useReveal<T extends HTMLElement>(threshold = 0.12): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

type BrowseFilters = { type?: string; for?: string; barangay?: string; q?: string }

// Show the browse section with these filters, e.g. showBrowse({ type: 'lot' }).
function showBrowse(filters?: BrowseFilters) {
  window.dispatchEvent(new CustomEvent('kf-browse', { detail: filters || {} }))
  const el = document.getElementById('browse')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function go(href: string) {
  window.location.href = href
}

// Blur Text: each word starts blurred and lifted, then settles, one after another.
function BlurText({ text, delay = 0, step = 0.09 }: { text: string; delay?: number; step?: number }) {
  const words = text.split(' ')
  return (
    <>
      {words.flatMap((w, i) => [
        <span key={'w' + i} className="blur-word" style={{ animationDelay: `${delay + i * step}s` }}>
          {w}
        </span>,
        i < words.length - 1 ? ' ' : null,
      ])}
    </>
  )
}

// Spotlight Card (verify + platform cards) and Magnet (the two hero buttons).
const SPOTLIGHT_CARDS = '.verify-card, .platform-item'
const MAGNET_TARGETS = '.hero-btn-browse, .hero-btn-list'
const MAGNET_REACH = 70
const MAGNET_STRENGTH = 5

function usePointerEffects() {
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!finePointer) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let ev: PointerEvent | null = null
    let queued = false

    const frame = () => {
      queued = false
      const e = ev
      if (!e) return
      const target = e.target as Element | null
      const card = target && target.closest ? (target.closest(SPOTLIGHT_CARDS) as HTMLElement | null) : null
      if (card) {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${e.clientX - r.left}px`)
        card.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
      if (calm) return
      document.querySelectorAll<HTMLElement>(MAGNET_TARGETS).forEach((btn) => {
        const r = btn.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const near =
          Math.abs(e.clientX - cx) < r.width / 2 + MAGNET_REACH &&
          Math.abs(e.clientY - cy) < r.height / 2 + MAGNET_REACH
        btn.style.transform = near
          ? `translate(${(e.clientX - cx) / MAGNET_STRENGTH}px, ${(e.clientY - cy) / MAGNET_STRENGTH}px)`
          : ''
      })
    }
    const onMove = (e: PointerEvent) => {
      ev = e
      if (!queued) {
        queued = true
        requestAnimationFrame(frame)
      }
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [])
}

// ── Hero ───────────────────────────────────────────────────────────────────────

const HERO_ROTATE_MS = 6500
const HERO_MAX_SLIDES = 6

function Hero({ featured }: { featured: Card[] }) {
  usePointerEffects()
  const heroRef = useRef<HTMLElement>(null)
  const [idx, setIdx] = useState(0)
  const [tick, setTick] = useState(0)

  // A listing without its own photo gets the placeholder; a placeholder is no hero.
  const slides = featured.filter((l) => l.image && l.image !== PLACEHOLDER).slice(0, HERO_MAX_SLIDES)
  const n = slides.length
  const at = n ? idx % n : 0
  const cur = n ? slides[at] : null

  // Stop animating once the hero is scrolled away (glass-nav.js did this in the original).
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || typeof IntersectionObserver !== 'function') return
    const obs = new IntersectionObserver(
      ([entry]) => hero.classList.toggle('hero-paused', !entry.isIntersecting),
      { rootMargin: '100px' },
    )
    obs.observe(hero)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (n < 2) return
    const t = setTimeout(() => {
      const hero = heroRef.current
      if (document.hidden || (hero && hero.classList.contains('hero-paused'))) {
        setTick((x) => x + 1)
        return
      }
      setIdx((i) => (i + 1) % n)
    }, HERO_ROTATE_MS)
    return () => clearTimeout(t)
  }, [idx, n, tick])

  return (
    <section className="hero hero-photo" ref={heroRef}>
      <div className="hero-bg" aria-hidden="true">
        {n ? (
          slides.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.id}
              src={s.image}
              alt=""
              decoding="async"
              className={`hero-bg-img${i === at ? ' is-active' : ''}`}
            />
          ))
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={PLACEHOLDER} alt="" className="hero-bg-img is-active" />
        )}
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-watermark" aria-hidden="true">
        KASAFIDE
      </div>

      <div className="hero-left">
        <h1 className="hero-title">
          <BlurText text="Buy. Sell. Rent." />
          <br />
          <BlurText text="All in one place." delay={0.27} />
          <span className="hero-title-accent shiny-text blur-word" style={{ animationDelay: '0.6s, 2.4s' }}>
            Verified, every time.
          </span>
        </h1>
        <p className="hero-desc">
          Kasafide connects buyers with verified property owners across Sta. Maria, Bulacan. No hidden listings. No
          unverified sellers.
        </p>
        <div className="hero-trust">
          <span className="hero-trust-item">
            <Svg className="hero-trust-icon" html={shieldIcon} />
            <span>Every seller ID-checked, every listing reviewed</span>
          </span>
        </div>
        <div className="hero-ctas">
          <button className="hero-btn-primary hero-btn-browse" onClick={() => showBrowse()}>
            <span>Browse Listings</span>
            <Svg className="hero-btn-arrow" html={heroArrowIcon} />
          </button>
          <button className="hero-btn-secondary hero-btn-list" onClick={() => go('/auth/signup?role=seller')}>
            <span>List Your Property</span>
          </button>
          <button className="hero-btn-mobile-signin" onClick={() => go('/auth/signin')}>
            Sign In
          </button>
          <button className="hero-btn-mobile-signup" onClick={() => go('/auth/signup')}>
            Sign Up
          </button>
        </div>
      </div>

      <div className="hero-side">
        {cur && (
          <div className="hero-feature">
            <button
              type="button"
              className="hf-thumb-btn"
              onClick={() => go(cur.href)}
              aria-label={`Featured: ${cur.title}, ${cur.price}${cur.period}. View listing.`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={'img-' + cur.id} className="hf-thumb" src={cur.image} alt="" />
            </button>
            <div className="hf-panel">
              <div key={'text-' + cur.id} className="hf-text">
                <span className="hf-kicker">{[cur.badge, cur.barangay].filter(Boolean).join(' · ')}</span>
                <button type="button" className="hf-title" tabIndex={-1} onClick={() => go(cur.href)}>
                  <span>{cur.title}</span>
                </button>
                <span className="hf-price">
                  {cur.price}
                  {cur.period && <small>{cur.period}</small>}
                </span>
              </div>
              {n > 1 && (
                <div className="hf-foot">
                  <div className="hf-dots">
                    {slides.map((s, i) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`hf-dot${i === at ? ' is-active' : ''}`}
                        aria-label={`Show featured listing ${i + 1} of ${n}`}
                        aria-current={i === at ? 'true' : undefined}
                        onClick={() => setIdx(i)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="hero-brgy">
          <div className="hero-brgy-head">Browse by category</div>
          <div className="hero-brgy-chips">
            {categories.map((c) => (
              <a
                key={c.type}
                className="hero-brgy-chip"
                href="#browse"
                onClick={(e) => {
                  e.preventDefault()
                  showBrowse({ type: c.type })
                }}
              >
                <Svg html={heroTypeIcons[c.type]} />
                {c.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Featured Properties ────────────────────────────────────────────────────────

function FeaturedCard({ prop }: { prop: Card }) {
  const specs: { icon: string; text: string }[] = []
  // A lot has no rooms — showing "0 bed · 0 bath" on land would read like missing data.
  if (prop.beds) specs.push({ icon: bedIcon, text: `${prop.beds} bed${prop.beds === 1 ? '' : 's'}` })
  if (prop.baths) specs.push({ icon: bathIcon, text: `${prop.baths} bath${prop.baths === 1 ? '' : 's'}` })
  const open = () => go(prop.href)

  return (
    <article
      className="fp-card"
      role="link"
      tabIndex={0}
      aria-label={`${prop.title}, ${prop.price}${prop.period}`}
      onClick={open}
      onKeyDown={onEnter(open)}
    >
      <div className="fp-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fp-img" src={prop.image} alt={prop.title} loading="lazy" />
        <span className={`fp-badge fp-badge-${prop.badgeType}`}>{prop.badge}</span>
        {prop.verified && <Svg className="fp-verified" html={checkIcon + '<span>Verified</span>'} />}
      </div>
      <div className="fp-body">
        <div className="fp-price">
          {prop.price}
          {prop.period && <span>{prop.period}</span>}
        </div>
        <h3 className="fp-title">{prop.title}</h3>
        <div className="fp-loc">
          <Svg html={pinIcon} />
          <span>{prop.location}</span>
        </div>
        <div className="fp-foot">
          <div className="fp-specs">
            {specs.map((s, i) => (
              <span key={i} className="fp-spec">
                <Svg html={s.icon} />
                {s.text}
              </span>
            ))}
          </div>
          <span className="fp-cta">View details →</span>
        </div>
      </div>
    </article>
  )
}

function Carousel({ featured }: { featured: Card[] }) {
  const [ref, visible] = useReveal<HTMLElement>()
  const trackRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const update = () =>
      setEdges({
        start: track.scrollLeft <= 2,
        end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2,
      })
    update()
    track.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(track)
    return () => {
      track.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [featured])

  const scrollByCard = (dir: number) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.fp-card')
    const step = card ? card.getBoundingClientRect().width + 20 : track.clientWidth
    track.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const cls = `section-alt reveal-section${visible ? ' in-view' : ''}`
  const header = (
    <>
      <span className="section-label">Featured Properties</span>
      <h2 className="section-title">Curated Listings Near You</h2>
    </>
  )

  if (!featured.length) {
    return (
      <section id="featured" className={cls} ref={ref}>
        {header}
        <p className="section-sub">No approved listings yet — check back soon, or be the first to list.</p>
      </section>
    )
  }

  const scrollable = !(edges.start && edges.end)

  return (
    <section id="featured" className={cls} ref={ref}>
      {header}
      <p className="section-sub">Approved listings from verified sellers in Sta. Maria, Bulacan</p>
      <div className="fp-stage">
        {scrollable && (
          <button
            className="fp-arrow fp-arrow-left"
            aria-label="Previous listings"
            disabled={edges.start}
            onClick={() => scrollByCard(-1)}
            dangerouslySetInnerHTML={{ __html: chevronLeft }}
          />
        )}
        <div className={`fp-track${scrollable ? '' : ' fp-track-fits'}`} ref={trackRef}>
          {featured.map((p) => (
            <FeaturedCard key={p.id} prop={p} />
          ))}
        </div>
        {scrollable && (
          <button
            className="fp-arrow fp-arrow-right"
            aria-label="More listings"
            disabled={edges.end}
            onClick={() => scrollByCard(1)}
            dangerouslySetInnerHTML={{ __html: chevronRight }}
          />
        )}
      </div>
      <a className="fp-all" href="#browse">
        Browse all properties →
      </a>
    </section>
  )
}

// ── Browse by Type ─────────────────────────────────────────────────────────────

// Tries each source in turn on load failure; hides itself once they're all used up.
function CategoryPhoto({ sources, alt }: { sources: string[]; alt: string }) {
  const [i, setI] = useState(0)
  const key = sources.join('|')
  useEffect(() => setI(0), [key])
  if (i >= sources.length) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="cat-photo" src={sources[i]} alt={alt} loading="lazy" onError={() => setI((n) => n + 1)} />
}

function Categories({ listings }: { listings: ListingCardView[] }) {
  const [ref, visible] = useReveal<HTMLElement>()
  const counts: Record<string, number> = {}
  const photos: Record<string, string> = {}
  for (const l of listings) {
    counts[l.propertyType] = (counts[l.propertyType] || 0) + 1
    if (!photos[l.propertyType] && l.coverUrl && l.coverUrl !== PLACEHOLDER) photos[l.propertyType] = l.coverUrl
  }

  return (
    <section className={`section reveal-section${visible ? ' in-view' : ''}`} ref={ref}>
      <span className="section-label">Browse by Type</span>
      <h2 className="section-title">Find What You&apos;re Looking For</h2>
      <p className="section-sub">Filter by property type or listing category</p>
      <div className="categories-grid">
        {categories.map((c) => {
          const n = counts[c.type] || 0
          const sources = (photos[c.type] ? [photos[c.type]] : []).concat(c.fallbacks)
          const open = () => showBrowse({ type: c.type })
          return (
            <div
              key={c.type}
              className="cat-card"
              role="link"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              onClick={open}
              onKeyDown={onEnter(open)}
            >
              <CategoryPhoto sources={sources} alt={c.name} />
              <div className="cat-shade" />
              <div className="cat-text">
                <div className="cat-name">{c.name}</div>
                <div className="cat-count">{n === 1 ? '1 listing' : `${n} listings`}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Map ────────────────────────────────────────────────────────────────────────

const MAP_MIN_SCALE = 0.5
const MAP_MAX_SCALE = 3
const VB_W = 1575
const VB_H = 1816

// Centres of each barangay's name label in "Sta. Maria Map.svg", in its own viewBox units.
const PIN_POSITIONS: Record<string, [number, number]> = {
  Silangan: [905, 149],
  'Mag-asawang Sapa': [786, 383],
  'Pulong Buhangin': [1093, 514],
  'Cay Pombo': [710, 668],
  Balasing: [1273, 742],
  Caysio: [531, 754],
  Manggahan: [352, 829],
  Bulac: [1399, 965],
  'Santa Cruz': [369, 1004],
  Guyong: [637, 1012],
  Catmon: [1093, 1095],
  'San Jose Patag': [731, 1188],
  'Santa Clara': [260, 1189],
  Poblacion: [466, 1250],
  Bagbaguin: [315, 1326],
  Lalakhan: [54, 1347],
  Tumana: [642, 1372],
  Parada: [890, 1384],
  'San Vicente': [1181, 1438],
  'San Gabriel': [480, 1482],
  'Tabing Bakod': [280, 1540],
  Buenavista: [786, 1607],
  Camangyanan: [585, 1643],
  'Mahabang Parang': [317, 1743],
  'Pulong Yantok': [1060, 340],
}
const PART_OF: Record<string, string> = { 'Pulong Yantok': 'Pulong Buhangin' }

function BarangayMap({ barangays }: { barangays: BarangayPinView[] }) {
  const mapWrapRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0, rotate: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [svgContent, setSvgContent] = useState('')
  const [near, setNear] = useState(false)

  useEffect(() => {
    const wrap = mapWrapRef.current
    if (!wrap) return
    if (typeof IntersectionObserver !== 'function') {
      setNear(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true)
        wrap.classList.toggle('is-offscreen', !entry.isIntersecting)
      },
      { rootMargin: '400px 0px' },
    )
    obs.observe(wrap)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!near) return
    let cancelled = false
    fetch('/assets/img/Sta. Maria Map.svg')
      .then((res) => res.text())
      .then((svg) => {
        if (!cancelled) setSvgContent(svg)
      })
      .catch((err) => console.error('Could not load the map:', err))
    return () => {
      cancelled = true
    }
  }, [near])

  const zoomBy = (d: number) =>
    setTransform((prev) => ({ ...prev, scale: Math.min(Math.max(MAP_MIN_SCALE, prev.scale + d), MAP_MAX_SCALE) }))
  const resetView = () => setTransform({ scale: 1, x: 0, y: 0, rotate: 0 })

  // Property markers, one per barangay with live listings.
  useEffect(() => {
    const container = containerRef.current
    if (!container || !svgContent) return

    const pins: { el: HTMLDivElement; x: number; y: number }[] = []
    const place = () => {
      const cw = container.clientWidth
      const ch = container.clientHeight
      const s = Math.min(1, cw / VB_W, ch / VB_H)
      const offX = (cw - VB_W * s) / 2
      const offY = (ch - VB_H * s) / 2
      pins.forEach(({ el, x, y }) => {
        el.style.left = `${offX + x * s}px`
        el.style.top = `${offY + y * s}px`
      })
    }

    barangays
      .filter((b) => b.listingCount > 0)
      .forEach((b, i) => {
        const pos = PIN_POSITIONS[b.name] || (b.mapX || b.mapY ? ([b.mapX, b.mapY] as [number, number]) : null)
        if (!pos) return
        const n = b.listingCount
        const label = PART_OF[b.name] ? `${b.name}, ${PART_OF[b.name]}` : b.name
        const pin = document.createElement('div')
        pins.push({ el: pin, x: pos[0], y: pos[1] })
        pin.className = 'property-marker'
        pin.style.animationDelay = `${i * 0.3}s`
        pin.setAttribute('role', 'link')
        pin.setAttribute('tabindex', '0')
        pin.setAttribute('aria-label', `${n} ${n === 1 ? 'property' : 'properties'} in ${label} — browse them`)
        pin.innerHTML = `
          <div class="marker-pulse"></div>
          <div class="marker-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/></svg>
          </div>
          <div class="marker-tooltip">${n} ${n === 1 ? 'property' : 'properties'} in ${label}</div>
        `
        // The map itself is drag-to-pan, so a pin must not open browse at the end of a drag.
        const open = (e: Event) => {
          e.stopPropagation()
          showBrowse({ barangay: b.name })
        }
        pin.addEventListener('click', open)
        pin.addEventListener('mousedown', (e) => e.stopPropagation())
        pin.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            open(e)
          }
        })
        container.appendChild(pin)
      })

    place()
    const ro = new ResizeObserver(place)
    ro.observe(container)
    return () => {
      ro.disconnect()
      pins.forEach((p) => p.el.remove())
    }
  }, [svgContent, barangays])

  useEffect(() => {
    const wrap = mapWrapRef.current
    if (!wrap) return

    // A plain scroll wheel scrolls the page; Ctrl/⌘ + wheel zooms, like an embedded map.
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const delta = e.deltaY * -0.001
      const newScale = Math.min(Math.max(MAP_MIN_SCALE, transform.scale + delta), MAP_MAX_SCALE)
      setTransform((prev) => ({ ...prev, scale: newScale }))
    }
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || (e.target as Element).closest('.smap-controls')) return
      if (e.shiftKey) {
        setIsRotating(true)
        setDragStart({ x: e.clientX, y: e.clientY })
      } else {
        setIsDragging(true)
        setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
      }
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (isRotating) {
        const deltaX = e.clientX - dragStart.x
        setTransform((prev) => ({ ...prev, rotate: prev.rotate + deltaX * 0.5 }))
        setDragStart({ x: e.clientX, y: e.clientY })
      } else if (isDragging) {
        setTransform((prev) => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }))
      }
    }
    const handleMouseUp = () => {
      setIsDragging(false)
      setIsRotating(false)
    }

    wrap.addEventListener('wheel', handleWheel, { passive: false })
    wrap.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      wrap.removeEventListener('wheel', handleWheel)
      wrap.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [transform, isDragging, isRotating, dragStart])

  const ctrlBtn = (label: string, text: string, onClick: () => void) => (
    <button type="button" className="smap-btn" aria-label={label} title={label} onClick={onClick}>
      {text}
    </button>
  )

  return (
    <div
      className="smap-wrap"
      ref={mapWrapRef}
      style={{ cursor: isDragging ? 'grabbing' : isRotating ? 'crosshair' : 'grab' }}
    >
      {!svgContent && <div className="smap-loading">Loading map…</div>}
      <div className="smap-controls">
        {ctrlBtn('Zoom in', '+', () => zoomBy(0.25))}
        {ctrlBtn('Zoom out', '−', () => zoomBy(-0.25))}
        {ctrlBtn('Reset view', '⟲', resetView)}
      </div>
      <div
        ref={containerRef}
        className="smap-canvas"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
          transformOrigin: 'center center',
          transition: isDragging || isRotating ? 'none' : 'transform 0.1s ease-out',
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  )
}

function MapSection({ barangays }: { barangays: BarangayPinView[] }) {
  const [ref, visible] = useReveal<HTMLElement>(0.08)
  const list = barangays
    .filter((b) => b.listingCount > 0)
    .sort((a, b) => b.listingCount - a.listingCount || a.name.localeCompare(b.name))

  return (
    <section id="map" className={`map-section reveal-section${visible ? ' in-view' : ''}`} ref={ref}>
      <div className="map-frame">
        <BarangayMap barangays={barangays} />
      </div>
      <div className="map-overlay">
        <div className="map-head">
          <span className="section-label">Explore the Map</span>
          <h2 className="section-title">Every Barangay in Sta. Maria</h2>
          <p className="map-sub">Each pin is a barangay with live listings. Click one to see what’s there.</p>
        </div>
        <aside className="map-side">
          <div className="map-side-title">Barangays with listings</div>
          {list.length ? (
            <ul className="map-side-list">
              {list.map((b) => (
                <li key={b.id}>
                  <button type="button" onClick={() => showBrowse({ barangay: b.name })}>
                    <span className="map-side-name">{b.name}</span>
                    <span className="map-side-count">{b.listingCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="map-side-empty">No live listings yet.</p>
          )}
        </aside>
        <p className="map-hint">Drag to move · Ctrl + scroll to zoom · Shift + drag to rotate</p>
      </div>
    </section>
  )
}

// ── How It Works ───────────────────────────────────────────────────────────────

// Where an element sits inside an ancestor, by layout (offsetTop/Left ignore transforms).
function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let x = 0
  let y = 0
  for (let node: HTMLElement | null = el; node && node !== root; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft
    y += node.offsetTop
  }
  return { x, y }
}

// The curve running down the timeline, measured from the real .tl-dot positions.
function useCurvedSpine(containerRef: RefObject<HTMLDivElement | null>, pathRef: RefObject<SVGPathElement | null>) {
  useEffect(() => {
    const box = containerRef.current
    const path = pathRef.current
    if (!box || !path) return
    const twoColumn = window.matchMedia('(min-width: 861px)')

    function draw() {
      if (!box || !path) return
      const svg = path.parentNode as SVGSVGElement
      if (!twoColumn.matches) {
        svg.style.display = 'none'
        return
      }
      svg.style.display = ''

      const rect = { width: box.offsetWidth, height: box.offsetHeight }
      const dots = [...box.querySelectorAll<HTMLElement>('.tl-dot')].map((dot) => {
        const at = offsetWithin(dot, box)
        return { x: at.x + dot.offsetWidth / 2, y: at.y + dot.offsetHeight / 2 }
      })
      if (dots.length < 2) return

      svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`)
      const swoop = Math.min(78, rect.width * 0.085)
      const radius = Math.min(46, rect.width * 0.043)
      const halfChord = radius * 0.76

      let d = `M ${dots[0].x} ${dots[0].y}`
      for (let i = 1; i < dots.length; i++) {
        const a = dots[i - 1]
        const b = dots[i]
        const dy = b.y - a.y
        const side = i % 2 ? 1 : -1
        if (i % 2) {
          const loopSide = ((i - 1) / 2) % 2 ? -1 : 1
          const mid = (a.y + b.y) / 2
          const enter = mid - halfChord
          const leave = mid + halfChord
          d += ` C ${a.x + swoop * loopSide * 0.45} ${a.y + dy * 0.26}, ${a.x} ${enter - dy * 0.2}, ${a.x} ${enter}`
          d += ` A ${radius} ${radius} 0 1 ${loopSide > 0 ? 1 : 0} ${a.x} ${leave}`
          d += ` C ${b.x} ${leave + dy * 0.2}, ${b.x + swoop * loopSide * 0.45} ${b.y - dy * 0.26}, ${b.x} ${b.y}`
        } else {
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
  }, [containerRef, pathRef])
}

const tlCheck = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="16 10 11 15 8 12"/></svg>`
const tlShield = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
const tlBed = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v5"/><path d="M2 9h20v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/></svg>`
const tlBath = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6V2"/><path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><line x1="4" y1="14" x2="20" y2="14"/></svg>`
const tlArea = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`

function TlWindow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="tl-window">
      <div className="tl-window-bar">
        <span className="tl-dot-r" />
        <span className="tl-dot-y" />
        <span className="tl-dot-g" />
        <span className="tl-window-title">{title}</span>
      </div>
      <div className="tl-window-body">{children}</div>
    </div>
  )
}

function TlDoc({ name, meta }: { name: string; meta: string }) {
  return (
    <div className="tl-doc">
      <div className="tl-doc-thumb">
        <Svg html={tlCheck} />
      </div>
      <div className="tl-doc-info">
        <div className="tl-doc-name">{name}</div>
        <div className="tl-doc-meta">{meta}</div>
      </div>
      <span className="tl-chip tl-chip-ok">Approved</span>
    </div>
  )
}

function TlPayItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="tl-pay-item">
      <span className="tl-pay-label">{label}</span>
      <span className="tl-pay-value">{value}</span>
    </div>
  )
}

function StepPreview({ name }: { name: string }) {
  if (name === 'verification')
    return (
      <TlWindow title="Verification">
        <div className="tl-docs">
          <TlDoc name="Valid ID" meta="Driver’s Licence · front and back" />
          <TlDoc name="Selfie with ID" meta="Taken in app" />
        </div>
        <div className="tl-verified">
          <Svg className="tl-verified-icon" html={tlShield} />
          <div>
            <div className="tl-verified-title">Verified Seller</div>
            <div className="tl-verified-sub">Checked by a Kasafide admin</div>
          </div>
        </div>
      </TlWindow>
    )
  if (name === 'listing')
    return (
      <TlWindow title="Browse">
        <div className="tl-filters">
          <span className="tl-filter">Poblacion</span>
          <span className="tl-filter">Up to ₱20,000</span>
          <span className="tl-filter">Apartment</span>
        </div>
        <div className="tl-listing">
          <div className="tl-listing-img">
            <span className="tl-listing-type">For Rent</span>
          </div>
          <div className="tl-listing-body">
            <div className="tl-listing-title">2BR Apartment</div>
            <div className="tl-listing-addr">Poblacion, Sta. Maria</div>
            <div className="tl-listing-price">
              ₱15,000<span>/month</span>
            </div>
            <div className="tl-listing-specs">
              <span>
                <i dangerouslySetInnerHTML={{ __html: tlBed }} />2
              </span>
              <span>
                <i dangerouslySetInnerHTML={{ __html: tlBath }} />1
              </span>
              <span>
                <i dangerouslySetInnerHTML={{ __html: tlArea }} />
                48 sqm
              </span>
            </div>
          </div>
        </div>
      </TlWindow>
    )
  if (name === 'messages')
    return (
      <TlWindow title="Messages">
        <div className="tl-msg tl-msg-them">
          <div className="tl-msg-bubble">Hi! Is the unit still available?</div>
          <div className="tl-msg-time">9:15 AM</div>
        </div>
        <div className="tl-msg tl-msg-me">
          <div className="tl-msg-bubble">Yes it is. Free this Saturday?</div>
          <div className="tl-msg-time">9:18 AM</div>
        </div>
        <div className="tl-msg tl-msg-them">
          <div className="tl-msg-bubble tl-msg-viewing">
            <div className="tl-viewing-tag">Viewing Request</div>
            <div className="tl-viewing-when">Sat, 14 June · 10:00 AM</div>
            <div className="tl-viewing-state">Accepted</div>
          </div>
          <div className="tl-msg-time">9:22 AM</div>
        </div>
      </TlWindow>
    )
  return (
    <TlWindow title="Payments">
      <div className="tl-pay">
        <div className="tl-pay-left">
          <div className="tl-pay-property">2BR Apartment — Poblacion</div>
          <div className="tl-pay-meta">
            <TlPayItem label="Type" value="Rent" />
            <TlPayItem label="Period" value="June 2026" />
            <TlPayItem label="Method" value="GCash" />
            <TlPayItem label="Reference" value="GC-78452" />
          </div>
        </div>
        <div className="tl-pay-right">
          <div className="tl-pay-amount">₱15,000</div>
          <span className="tl-chip tl-chip-ok">Confirmed</span>
        </div>
      </div>
    </TlWindow>
  )
}

function HowItWorks() {
  const [ref, visible] = useReveal<HTMLElement>()
  const stepsRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  useCurvedSpine(stepsRef, pathRef)

  return (
    <section id="how-it-works" className={`section reveal-section${visible ? ' in-view' : ''}`} ref={ref}>
      <span className="section-label">How It Works</span>
      <h2 className="section-title">Simple Steps to Your Next Home</h2>
      <p className="section-sub">Get started in minutes — no complicated process</p>
      <div className="how-steps" ref={stepsRef}>
        <svg className="tl-spine" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="tl-spine-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'rgb(var(--primary-rgb) / 0)' }} />
              <stop offset="0.09" style={{ stopColor: 'rgb(var(--primary-rgb) / 0.34)' }} />
              <stop offset="0.91" style={{ stopColor: 'rgb(var(--primary-rgb) / 0.34)' }} />
              <stop offset="1" style={{ stopColor: 'rgb(var(--primary-rgb) / 0)' }} />
            </linearGradient>
          </defs>
          <path className="tl-spine-path" ref={pathRef} fill="none" />
        </svg>
        {steps.map((s, i) => (
          <div key={s.num} className={`how-step tl-step${i % 2 ? ' tl-flip' : ''}`}>
            <div className="tl-preview">
              <StepPreview name={s.screen} />
            </div>
            <div className="tl-dot" aria-hidden="true" />
            <div className="tl-text">
              <div className="tl-head">
                <span className="tl-num">{s.num}</span>
                <span className="tl-label">{s.label}</span>
              </div>
              <h3 className="tl-title">{s.title}</h3>
              <p className="tl-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Trust ──────────────────────────────────────────────────────────────────────

function TrustBanner() {
  return (
    <section className="trust-banner">
      <div className="trust-content">
        <Svg
          className="trust-icon"
          html={`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`}
        />
        <h3 className="trust-text">
          Every listing is reviewed. Every seller is verified. <span className="trust-highlight">No exceptions.</span>
        </h3>
        <p className="trust-subtext">
          Your safety is our priority. All sellers undergo government ID verification before posting.
        </p>
      </div>
    </section>
  )
}

const verifySteps = [
  {
    tag: 'Step 1',
    title: 'The email has to be real',
    desc: 'Signing up does not get you in. We send a one-time link to the address given, and the account stays closed until it is opened. An address nobody can receive mail at never becomes an account.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>`,
  },
  {
    tag: 'Step 2',
    title: 'A government ID and a live selfie',
    desc: 'Sellers submit a valid ID and take a selfie through the camera, in the app — not a photo chosen from a gallery. An administrator compares the two before the account is marked verified.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="9" cy="12" r="2.6"/><path d="M14.5 10h4M14.5 14h3"/></svg>`,
  },
  {
    tag: 'Step 3',
    title: 'Proof the property is theirs',
    desc: 'Every listing carries photographs of its Deed of Sale or Transfer Certificate of Title, or a tax declaration. One per property — a verified seller still cannot post a house they cannot document.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg>`,
  },
  {
    tag: 'Step 4',
    title: 'Nothing is public until it is reviewed',
    desc: 'A new listing is not hidden behind a label — it is not on the site at all. It appears in browse only after an administrator approves it, and it comes straight back down if a seller’s verification lapses.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  },
]

function HowWeVerify() {
  const [ref, visible] = useReveal<HTMLElement>()
  return (
    <section
      id="how-we-verify"
      className={`section reveal-section verify-section${visible ? ' in-view' : ''}`}
      ref={ref}
    >
      <span className="section-label">How We Verify</span>
      <h2 className="section-title">Four Things Nobody Gets Past</h2>
      <p className="section-sub">Not a promise about how careful we are — four checks the platform refuses to skip</p>
      <div className="verify-grid">
        {verifySteps.map((s) => (
          <div key={s.tag} className="verify-card">
            <div className="verify-card-top">
              <Svg className="verify-icon" html={s.icon} />
              <span className="verify-tag">{s.tag}</span>
            </div>
            <h3 className="verify-title">{s.title}</h3>
            <p className="verify-desc">{s.desc}</p>
          </div>
        ))}
      </div>
      <p className="verify-note">
        Verification does not expire quietly. When a seller’s documents lapse they are moved back to re-verification,
        and their listings leave the site until the new ones are approved.
      </p>
    </section>
  )
}

// ── What you get ───────────────────────────────────────────────────────────────

function Features() {
  const [ref, visible] = useReveal<HTMLElement>()
  return (
    <section className={`section-alt reveal-section${visible ? ' in-view' : ''}`} ref={ref}>
      <div className="features-inner">
        <span className="section-label">Why Kasafide</span>
        <h2 className="section-title">Built for Trust &amp; Transparency</h2>
        <p className="section-sub">A platform designed with security and convenience at its core</p>
        <div className="features-card-wrap">
          {whyFeatures.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" dangerouslySetInnerHTML={{ __html: f.icon }} />
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const TILT_DEGREES = 9

// The three cards tilt toward the pointer; one listener, applied once per frame.
function useCardTilt(gridRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || still.matches) return

    grid.classList.add('tilt-on')
    let frame = 0
    let pending: { card: HTMLElement; px: number; py: number; w: number; h: number } | null = null
    let current: HTMLElement | null = null

    function clear(card: HTMLElement | null) {
      if (!card) return
      card.classList.remove('is-tilting')
      for (const prop of ['--rx', '--ry', '--gx', '--gy']) card.style.removeProperty(prop)
    }
    function apply() {
      frame = 0
      if (!pending) return
      const { card, px, py, w, h } = pending
      card.style.setProperty('--rx', `${(0.5 - py / h) * TILT_DEGREES}deg`)
      card.style.setProperty('--ry', `${(px / w - 0.5) * TILT_DEGREES}deg`)
      card.style.setProperty('--gx', `${px}px`)
      card.style.setProperty('--gy', `${py}px`)
    }
    function onMove(e: PointerEvent) {
      const t = e.target as Element | null
      const card = t && t.closest ? (t.closest('.feature-card') as HTMLElement | null) : null
      if (!card) {
        if (current) {
          clear(current)
          current = null
        }
        return
      }
      if (current && current !== card) clear(current)
      if (current !== card) {
        card.classList.add('is-tilting')
        current = card
      }
      const r = card.getBoundingClientRect()
      pending = { card, px: e.clientX - r.left, py: e.clientY - r.top, w: r.width, h: r.height }
      if (!frame) frame = requestAnimationFrame(apply)
    }
    function onLeave() {
      if (frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
      pending = null
      clear(current)
      current = null
    }

    grid.addEventListener('pointermove', onMove)
    grid.addEventListener('pointerleave', onLeave)
    return () => {
      grid.removeEventListener('pointermove', onMove)
      grid.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
      clear(current)
      grid.classList.remove('tilt-on')
    }
  }, [gridRef])
}

const highlights = [
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    title: 'Admin-Verified Listings',
    desc: 'Every listing reviewed before publishing',
    color: 'var(--primary)',
    badge: 'VERIFIED',
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3v-8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
    title: 'Secure In-Chat Payments',
    desc: 'Agree on price and send payment requests within the chat',
    color: 'var(--info)',
    badge: 'SECURE',
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
    title: 'Anti-Fraud Protection',
    desc: 'Government ID verification for all sellers',
    color: 'var(--warning)',
    badge: 'PROTECTED',
  },
]

function FeatureHighlights() {
  const gridRef = useRef<HTMLDivElement>(null)
  useCardTilt(gridRef)
  return (
    <section className="feature-highlights">
      <div className="feature-grid" ref={gridRef}>
        {highlights.map((feat) => (
          <div
            key={feat.title}
            className="feature-card feature-3d"
            style={{ '--feature-color': feat.color } as CSSProperties}
          >
            <div className="feature-card-bg" aria-hidden="true">
              <span className="feature-card-glare" />
            </div>
            <div className="feature-card-icon" dangerouslySetInnerHTML={{ __html: feat.icon }} />
            <div className="feature-card-badge">{feat.badge}</div>
            <h3 className="feature-card-title">{feat.title}</h3>
            <p className="feature-card-desc">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const platformFeatures = [
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3v-8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
    title: 'In-Chat Payment Requests',
    desc: 'Request and track payments directly in conversations',
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
    title: 'Security Deposit Management',
    desc: 'Automated deposit tracking and refund processing',
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`,
    title: 'Damage Reporting System',
    desc: 'Photo uploads and dispute resolution tools',
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    title: 'Barangay-Level Search',
    desc: 'Find properties in all 24 barangays of Sta. Maria',
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
    title: 'Verified Seller Badges',
    desc: 'Government ID verification for all property owners',
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>`,
    title: 'Real-Time Messaging',
    desc: 'Instant chat with sellers, no phone numbers required',
  },
]

function PlatformFeatures() {
  return (
    <section className="platform-features">
      <h2 className="section-title">Platform Features</h2>
      <p className="section-subtitle">Everything you need for safe and secure property rentals</p>
      <div className="platform-grid">
        {platformFeatures.map((feat) => (
          <div key={feat.title} className="platform-item">
            <div className="platform-icon" dangerouslySetInnerHTML={{ __html: feat.icon }} />
            <h3 className="platform-title">{feat.title}</h3>
            <p className="platform-desc">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Numbers ────────────────────────────────────────────────────────────────────

function useCounter(end: number, duration: number, active: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    if (end <= 0) {
      setVal(end)
      return
    }
    let start = 0
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setVal(end)
        clearInterval(timer)
      } else setVal(start)
    }, 16)
    return () => clearInterval(timer)
  }, [active, end, duration])
  return val
}

function StatBox({ end, label }: { end: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setActive(true)
      },
      { threshold: 0.4 },
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const count = useCounter(end, 1800, active)
  return (
    <div className="stat-box" ref={ref}>
      <div className="stat-value">{count.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export type LandingStats = {
  barangaysCovered: number
  listingsLive: number
  verifiedSellers: number
  unverifiedListings: number
}

function Stats({ stats }: { stats: LandingStats }) {
  const [ref, visible] = useReveal<HTMLElement>()
  const items = [
    { end: stats.barangaysCovered || 24, label: 'Barangays Covered' },
    { end: stats.listingsLive, label: 'Listings Live' },
    { end: stats.verifiedSellers, label: 'Verified Sellers' },
    { end: stats.unverifiedListings, label: 'Unverified Listings' },
  ]
  return (
    <section className={`section reveal-section${visible ? ' in-view' : ''}`} ref={ref}>
      <div className="stats-inner">
        <span className="section-label">Our Numbers</span>
        <h2 className="section-title">Where Kasafide Stands Today</h2>
        <p className="section-sub">Counted live from the platform, not rounded up for a landing page</p>
        <div className="stats-grid">
          {items.map((s) => (
            <StatBox key={s.label} end={s.end} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Browse ─────────────────────────────────────────────────────────────────────

const BROWSE_TYPES: [string, string][] = [
  ['', 'All types'],
  ['house', 'House'],
  ['apartment', 'Apartment'],
  ['condo', 'Condo'],
  ['commercial', 'Commercial'],
  ['lot', 'Lot only'],
]
const BROWSE_FOR: [string, string][] = [
  ['', 'For sale & rent'],
  ['rent', 'For rent'],
  ['sale', 'For sale'],
]
const NO_FILTERS = { type: '', for: '', barangay: '', q: '' }
type Filters = typeof NO_FILTERS

function BrowseSection({ listings }: { listings: ListingCardView[] }) {
  const [ref, visible] = useReveal<HTMLElement>(0.05)
  const [f, setF] = useState<Filters>(NO_FILTERS)

  useEffect(() => {
    const onBrowse = (e: Event) => setF({ ...NO_FILTERS, ...(e as CustomEvent<BrowseFilters>).detail })
    window.addEventListener('kf-browse', onBrowse)
    return () => window.removeEventListener('kf-browse', onBrowse)
  }, [])

  const barangays = [...new Set(listings.map((l) => l.barangayName).filter(Boolean))].sort()
  if (f.barangay && !barangays.includes(f.barangay)) barangays.push(f.barangay)

  const q = f.q.trim().toLowerCase()
  const shown = listings.filter(
    (l) =>
      (!f.type || l.propertyType === f.type) &&
      (!f.for || l.listingType === f.for) &&
      (!f.barangay || l.barangayName === f.barangay) &&
      (!q || [l.title, l.address, l.barangayName].some((v) => (v || '').toLowerCase().includes(q))),
  )
  const filtering = !!(f.type || f.for || f.barangay || q)
  const set = (key: keyof Filters) => (e: { target: { value: string } }) =>
    setF((prev) => ({ ...prev, [key]: e.target.value }))
  const select = (key: keyof Filters, label: string, options: [string, string][]) => (
    <select className="bs-field" value={f[key]} onChange={set(key)} aria-label={label}>
      {options.map(([v, t]) => (
        <option key={v} value={v}>
          {t}
        </option>
      ))}
    </select>
  )

  return (
    <section id="browse" className={`section browse-section reveal-section${visible ? ' in-view' : ''}`} ref={ref}>
      <span className="section-label">Browse</span>
      <h2 className="section-title">All Properties</h2>
      <p className="section-sub">
        Every approved listing in Sta. Maria, Bulacan. Narrow it down by type, barangay, or a search.
      </p>
      <div className="bs-filters">
        {select('type', 'Property type', BROWSE_TYPES)}
        {select('for', 'For sale or rent', BROWSE_FOR)}
        {select(
          'barangay',
          'Barangay',
          ([['', 'All barangays']] as [string, string][]).concat(barangays.map((b) => [b, b])),
        )}
        <input
          className="bs-field bs-search"
          type="search"
          value={f.q}
          onChange={set('q')}
          placeholder="Search by title or address…"
          aria-label="Search listings"
        />
      </div>
      <div className="bs-meta">
        <span>{`${shown.length} propert${shown.length === 1 ? 'y' : 'ies'} found`}</span>
        {filtering && (
          <button type="button" className="bs-clear" onClick={() => setF(NO_FILTERS)}>
            Clear filters
          </button>
        )}
      </div>
      {shown.length ? (
        <div className="bs-grid">
          {shown.map((l) => (
            <FeaturedCard key={l.id} prop={toCard(l)} />
          ))}
        </div>
      ) : (
        <p className="bs-empty">{filtering ? 'No listings match those filters.' : 'No approved listings yet.'}</p>
      )}
    </section>
  )
}

// ── Closing ────────────────────────────────────────────────────────────────────

function CTA() {
  const [ref, visible] = useReveal<HTMLDivElement>()
  return (
    <div className={`cta-section reveal-section${visible ? ' in-view' : ''}`} ref={ref}>
      <div className="cta-inner">
        <h2 className="cta-title">Ready to Find Your Next Home?</h2>
        <p className="cta-sub">Join verified buyers and sellers finding trusted properties in Sta. Maria, Bulacan</p>
        <div className="cta-btns">
          <button className="cta-btn-white" onClick={() => go('/auth/signup?role=buyer')}>
            Sign Up as Buyer
          </button>
          <button className="cta-btn-ghost" onClick={() => go('/auth/signup?role=seller')}>
            List Your Property
          </button>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  const cols: [string, [string, string][]][] = [
    [
      'Platform',
      [
        ['Browse Listings', '#browse'],
        ['List Your Property', '/auth/signup?role=seller'],
        ['About Us', '/about'],
      ],
    ],
    [
      'Support',
      [
        ['Help & Support', '/help'],
        ['FAQs', '/faqs'],
      ],
    ],
    [
      'Legal',
      [
        ['Privacy Policy', '/privacy-policy'],
        ['Terms of Service', '/terms'],
      ],
    ],
  ]
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-logo">
            <span className="kf-logo-wrap" style={{ display: 'inline-flex' }}>
              <KasafideLogo size={28} label="" />
            </span>
            Kasafide
          </div>
          <p className="footer-tagline">
            A verified housing platform for secure property rentals and purchases in Sta. Maria, Bulacan.
          </p>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <div className="footer-col-title">{title}</div>
            {links.map(([label, href]) => (
              <a key={label} className="footer-link" href={href}>
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-divider" />
      <div className="footer-copy">© 2026 Kasafide. All rights reserved.</div>
    </footer>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

// Order, top to bottom: find a place (listings, type, barangay map) -> how it works -> why you
// can trust it -> what the platform does for you -> the live numbers -> every listing -> sign up.
export function LandingSections({
  listings,
  barangays,
  stats,
}: {
  listings: ListingCardView[]
  barangays: BarangayPinView[]
  stats: LandingStats
}) {
  const featured = listings.slice(0, 8).map(toCard)
  return (
    <div className="kf-landing">
      <Hero featured={featured} />
      <Carousel featured={featured} />
      <Categories listings={listings} />
      <MapSection barangays={barangays} />
      <HowItWorks />
      <TrustBanner />
      <HowWeVerify />
      <Features />
      <FeatureHighlights />
      <PlatformFeatures />
      <Stats stats={stats} />
      <BrowseSection listings={listings} />
      <CTA />
      <Footer />
    </div>
  )
}
