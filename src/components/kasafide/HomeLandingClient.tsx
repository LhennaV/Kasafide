'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { BarangayPinView, ListingCardView } from '@/lib/kasafide-data'
import { PropertyCard } from './PropertyCard'
import { StaMariaMapSection } from './StaMariaMapSection'

const CATEGORIES = [
  { label: 'Houses', type: 'house' as const },
  { label: 'Apartments', type: 'apartment' as const },
  { label: 'Lots & Land', type: 'lot' as const },
]

const VERIFY_STEPS = [
  {
    tag: 'Step 1',
    title: 'Real Account Identity',
    desc: 'Buyers and sellers register with verified credentials or Google OAuth, tying every listing and message to an accountable identity.',
  },
  {
    tag: 'Step 2',
    title: 'A Government ID & Live Selfie',
    desc: 'Sellers submit a valid government ID and live selfie in-app. An administrator compares both before marking the account verified.',
  },
  {
    tag: 'Step 3',
    title: 'Proof the Property Is Theirs',
    desc: 'Every listing carries its Transfer Certificate of Title (TCT), Deed of Sale, or Tax Declaration — verified per property.',
  },
  {
    tag: 'Step 4',
    title: 'Nothing Is Public Until Reviewed',
    desc: 'New listings stay out of public browse until a Kasafide administrator approves them and checks seller verification validity.',
  },
]

const PLATFORM_FEATURES = [
  {
    title: 'In-Chat Payment Requests',
    desc: 'Request and track monthly rent, reservation fees, and deposits directly inside conversations.',
  },
  {
    title: 'Security Deposit Management',
    desc: 'Structured deposit ledger and transparent refund processing backed by signed Seller MOA.',
  },
  {
    title: 'Fraud & Issue Reporting',
    desc: 'Built-in reporting workflow investigated directly by Kasafide Trust & Safety admins.',
  },
  {
    title: 'Barangay-Level Search',
    desc: 'Filter properties across all 24 official barangays of Sta. Maria, Bulacan.',
  },
  {
    title: 'Verified Seller Badges',
    desc: 'Government ID + LRA land title verification badges visible on every approved card.',
  },
  {
    title: 'Direct Owner Messaging',
    desc: 'Schedule property viewings and chat directly with owners without exposing personal numbers.',
  },
]

export function HomeLandingClient({
  listings,
  barangays,
  stats,
}: {
  listings: ListingCardView[]
  barangays: BarangayPinView[]
  stats: {
    barangaysCovered: number
    listingsLive: number
    verifiedSellers: number
    unverifiedListings: number
  }
}) {
  const slides = listings.slice(0, 5)
  const [slideIdx, setSlideIdx] = useState(0)
  const carouselRef = useRef<HTMLDivElement | null>(null)

  const [filterType, setFilterType] = useState('')
  const [filterFor, setFilterFor] = useState('')
  const [filterBarangay, setFilterBarangay] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  useEffect(() => {
    if (slides.length < 2) return
    const timer = setTimeout(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length)
    }, 6500)
    return () => clearTimeout(timer)
  }, [slideIdx, slides.length])

  const activeSlide = slides[slideIdx] || null

  const filteredListings = listings.filter((item) => {
    if (filterType && item.propertyType !== filterType) return false
    if (filterFor && item.listingType !== filterFor) return false
    if (filterBarangay && item.barangaySlug !== filterBarangay) return false
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const hit =
        item.title.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.barangayName.toLowerCase().includes(q)
      if (!hit) return false
    }
    return true
  })

  function jumpToBrowseWith(opts: { type?: string; barangay?: string }) {
    if (opts.type !== undefined) setFilterType(opts.type)
    if (opts.barangay !== undefined) setFilterBarangay(opts.barangay)
    const el = document.getElementById('browse')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 px-4 sm:px-8 overflow-hidden bg-[#1E1230] text-[#FBF6F0]">
        <div className="absolute inset-0" aria-hidden="true">
          {slides.length > 0 ? (
            slides.map((s, idx) => (
              <div
                key={s.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  idx === slideIdx ? 'opacity-45' : 'opacity-0'
                }`}
              >
                <Image
                  src={s.coverUrl}
                  alt=""
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            <Image
              src="/assets/img/house_image.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-35"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E1230]/95 via-[#1E1230]/80 to-[#1E1230]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E1230] via-transparent to-[#1E1230]/40" />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute -bottom-6 right-4 text-[76px] sm:text-[150px] font-black tracking-tighter text-white/[0.03] leading-none"
        >
          KASAFIDE
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-[#FF8A65] mb-5 backdrop-blur-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Every seller ID-checked, every listing reviewed</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] mb-5">
              <span className="kf-blur-word">Buy. Sell. Rent.</span>
              <br />
              <span className="kf-blur-word">All in one place.</span>
              <span className="block text-[#FF8A65] mt-1">Verified, every time.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#DDD0EA] max-w-xl leading-relaxed mb-7">
              Kasafide connects buyers and renters with verified property owners across all 24 barangays of Sta. Maria, Bulacan. No hidden listings. No unverified sellers.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => jumpToBrowseWith({})}
                className="px-6 py-3.5 rounded-full bg-[#FF8A65] hover:bg-[#FFA182] text-[#2B1B3D] font-extrabold text-sm inline-flex items-center gap-2 shadow-lg cursor-pointer transition"
              >
                <span>Browse Listings</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <Link
                href="/auth/signup?role=seller"
                className="px-6 py-3.5 rounded-full border border-white/25 bg-white/10 hover:bg-white/15 text-[#FBF6F0] font-bold text-sm backdrop-blur-sm transition"
              >
                List Your Property
              </Link>

              <div className="sm:hidden grid grid-cols-2 gap-2.5 w-full mt-1">
                <Link
                  href="/auth/signin"
                  className="py-3 rounded-full bg-[#5B3A8E] text-[#FBF6F0] font-extrabold text-sm text-center shadow-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="py-3 rounded-full border border-white/25 bg-white/10 text-[#FBF6F0] font-extrabold text-sm text-center"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            {activeSlide && (
              <div className="rounded-3xl border border-white/15 bg-[#2B1B3D]/85 backdrop-blur-xl p-4 shadow-2xl">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <Link
                    href={`/listings/${activeSlide.slug}`}
                    className="col-span-5 relative h-36 rounded-2xl overflow-hidden block"
                  >
                    <Image
                      src={activeSlide.coverUrl}
                      alt={activeSlide.coverAlt}
                      fill
                      sizes="220px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="col-span-7 flex flex-col">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF8A65] mb-1">
                      {activeSlide.listingType === 'rent' ? 'For Rent' : 'For Sale'} &middot;{' '}
                      {activeSlide.barangayName}
                    </span>
                    <Link
                      href={`/listings/${activeSlide.slug}`}
                      className="font-extrabold text-base text-[#FBF6F0] hover:text-[#FF8A65] line-clamp-2 mb-2"
                    >
                      {activeSlide.title}
                    </Link>
                    <div className="text-lg font-black text-[#FF8A65] mb-3">
                      {activeSlide.priceFormatted}
                      <span className="text-xs font-semibold text-[#DDD0EA]">
                        {activeSlide.periodLabel}
                      </span>
                    </div>
                    {slides.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        {slides.map((s, i) => (
                          <button
                            key={s.id}
                            type="button"
                            aria-label={`Show slide ${i + 1}`}
                            onClick={() => setSlideIdx(i)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              i === slideIdx ? 'w-6 bg-[#FF8A65]' : 'w-2 bg-white/30'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-md p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#DDD0EA] mb-2.5">
                Browse by Category
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => jumpToBrowseWith({ type: cat.type })}
                    className="px-3.5 py-2 rounded-xl bg-[#2B1B3D]/80 hover:bg-[#FF8A65] hover:text-[#2B1B3D] border border-white/10 text-xs font-bold text-[#FBF6F0] transition cursor-pointer"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--primary)]">
              Featured Properties
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text)] mt-1">
              Curated Listings Near You
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Scroll featured left"
              onClick={() => carouselRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text)] hover:border-[var(--primary)] cursor-pointer"
            >
              &larr;
            </button>
            <button
              type="button"
              aria-label="Scroll featured right"
              onClick={() => carouselRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text)] hover:border-[var(--primary)] cursor-pointer"
            >
              &rarr;
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4"
        >
          {listings.map((prop) => (
            <div key={prop.id} className="min-w-[290px] sm:min-w-[340px] max-w-[350px] snap-start shrink-0">
              <PropertyCard property={prop} showSaveButton />
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--primary)]">
            Browse by Type
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text)] mt-1">
            Find What You&apos;re Looking For
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Filter by verified houses, apartments, or residential lots in Sta. Maria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const matching = listings.filter((l) => l.propertyType === cat.type)
            const sampleImg = matching[0]?.coverUrl || '/assets/img/house_image.jpg'
            return (
              <button
                key={cat.type}
                type="button"
                onClick={() => jumpToBrowseWith({ type: cat.type })}
                className="group relative h-64 rounded-3xl overflow-hidden border border-[var(--border)] text-left cursor-pointer shadow-md"
              >
                <Image
                  src={sampleImg}
                  alt={cat.label}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E1230]/90 via-[#1E1230]/35 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="text-2xl font-black text-[#FBF6F0]">{cat.label}</div>
                  <div className="text-xs font-bold text-[#FF8A65] mt-1">
                    {matching.length} {matching.length === 1 ? 'listing' : 'listings'} available &rarr;
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <StaMariaMapSection
        barangays={barangays}
        onSelectBarangay={(slug) => setFilterBarangay(slug)}
      />

      <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--primary)]">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text)] mt-1">
            Simple Steps to Your Next Home
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Get started in minutes — verified at every step
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-xs font-black">
                  01
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Account
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[var(--text)] mb-1.5">Create an Account</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Sign up as a buyer or seller via email or Google Sign-In. Verify your identity so the person on the other side knows who they are dealing with.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A8A]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F4BC5C]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#6FD394]" />
                <span className="ml-2 text-[11px] font-bold text-[var(--text-muted)]">Verification</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)]">
                  <span className="font-bold text-[var(--text)]">Valid Government ID</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--success)]/15 text-[var(--success)] font-bold">
                    Approved
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)]">
                  <span className="font-bold text-[var(--text)]">Live Camera Selfie</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--success)]/15 text-[var(--success)] font-bold">
                    Verified Seller
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-xs font-black">
                  02
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Discover
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[var(--text)] mb-1.5">Browse or List</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Search by barangay, budget, and property type across Sta. Maria — or post your own titled property and let verified buyers come to you.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A8A]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F4BC5C]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#6FD394]" />
                <span className="ml-2 text-[11px] font-bold text-[var(--text-muted)]">Browse</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5 text-[11px] font-bold">
                <span className="px-2.5 py-1 rounded-full bg-[var(--surface)] text-[var(--primary)]">Poblacion</span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--surface)] text-[var(--text)]">Up to ₱20,000</span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--surface)] text-[var(--text)]">Apartment</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface)] flex items-center justify-between text-xs">
                <div>
                  <div className="font-extrabold text-[var(--text)]">2BR Apartment &middot; Poblacion</div>
                  <div className="text-[var(--text-muted)]">2 beds &middot; 1 bath &middot; 54 sqm</div>
                </div>
                <span className="font-extrabold text-[var(--primary)]">₱12,500/mo</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-xs font-black">
                  03
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Connect
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[var(--text)] mb-1.5">Message the Owner</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Talk to the seller inside Kasafide. Arrange a viewing, ask about utilities, and keep the entire thread recorded safely.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--surface)] max-w-[82%] text-[var(--text)]">
                Hi! Is the 2BR unit in Poblacion still open for Saturday viewing?
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-semibold max-w-[82%] ml-auto">
                Yes! Viewing Request Accepted &middot; Sat 10:00 AM
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-xs font-black">
                  04
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Payment
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[var(--text)] mb-1.5">Pay &amp; Move In</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Pay via QR Ph or upload GCash/Maya proof. The verified landowner confirms receipt and both sides keep an immutable payment record.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 flex items-center justify-between text-xs">
              <div>
                <div className="font-extrabold text-[var(--text)]">2BR Apartment — Poblacion</div>
                <div className="text-[var(--text-muted)] mt-0.5">GCash &middot; Ref KF-GC-78452</div>
              </div>
              <div className="text-right">
                <div className="font-black text-sm text-[var(--primary)]">₱12,500</div>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[var(--success)]/15 text-[var(--success)] font-bold">
                  Confirmed
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-[#5B3A8E]/20 via-[#FF8A65]/10 to-[#5B3A8E]/20 border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text)] leading-tight mb-3">
            Every listing is reviewed. Every seller is verified.{' '}
            <span className="text-[var(--primary)]">No exceptions.</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl mx-auto">
            Your safety is our priority. All sellers undergo government ID and land-title checks before their listings appear in public browse.
          </p>
        </div>
      </section>

      <section id="how-we-verify" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--primary)]">
            How We Verify
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text)] mt-1">
            Four Things Nobody Gets Past
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Not a marketing promise — four checks enforced by the platform
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VERIFY_STEPS.map((step) => (
            <div
              key={step.tag}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col"
            >
              <span className="self-start px-2.5 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-extrabold mb-4">
                {step.tag}
              </span>
              <h3 className="font-extrabold text-base text-[var(--text)] mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--primary)]">
            Platform Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text)] mt-1">
            Built for Trust &amp; Transparency
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {PLATFORM_FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-[var(--primary)] transition"
            >
              <h3 className="font-extrabold text-base text-[var(--text)] mb-2">{feat.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-8 sm:p-10">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--primary)]">
              Our Numbers
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[var(--text)] mt-1">
              Where Kasafide Stands Today
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Counted live from Payload CMS, never rounded up
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: stats.barangaysCovered, label: 'Barangays Covered' },
              { value: stats.listingsLive, label: 'Listings Live' },
              { value: stats.verifiedSellers, label: 'Verified Sellers' },
              { value: stats.unverifiedListings, label: 'Unverified Listings' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5 text-center"
              >
                <div className="text-3xl sm:text-4xl font-black text-[var(--primary)]">
                  {s.value}
                </div>
                <div className="text-xs font-bold text-[var(--text-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="browse" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--primary)]">
            Browse
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text)] mt-1">
            All Verified Properties
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Every approved listing in Sta. Maria, Bulacan. Narrow down by type, transaction, or barangay.
          </p>
        </div>

        <div className="md:hidden mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm font-bold text-[var(--text)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter Properties
          </button>
          {(filterType || filterFor || filterBarangay || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilterType('')
                setFilterFor('')
                setFilterBarangay('')
                setSearchQuery('')
              }}
              className="py-3 px-4 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="hidden md:grid grid-cols-4 gap-3 mb-6 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <select
            aria-label="Property type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)]"
          >
            <option value="">All Property Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="commercial">Commercial</option>
            <option value="lot">Lot Only</option>
          </select>

          <select
            aria-label="For sale or rent"
            value={filterFor}
            onChange={(e) => setFilterFor(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)]"
          >
            <option value="">For Sale &amp; Rent</option>
            <option value="rent">For Rent</option>
            <option value="sale">For Sale</option>
          </select>

          <select
            aria-label="Barangay"
            value={filterBarangay}
            onChange={(e) => setFilterBarangay(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)]"
          >
            <option value="">All 24 Barangays</option>
            {barangays.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>

          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title or address…"
            className="px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)]"
          />
        </div>

        {mobileFilterOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs">
            <div className="w-full rounded-t-3xl bg-[var(--surface)] border-t border-[var(--border)] p-5 space-y-4 safe-bottom">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[var(--text)]">Filter Properties</h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-sm font-bold text-[var(--text-muted)] cursor-pointer"
                >
                  Close
                </button>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              >
                <option value="">All Property Types</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="commercial">Commercial</option>
                <option value="lot">Lot Only</option>
              </select>
              <select
                value={filterFor}
                onChange={(e) => setFilterFor(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              >
                <option value="">For Sale &amp; Rent</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
              <select
                value={filterBarangay}
                onChange={(e) => setFilterBarangay(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              >
                <option value="">All 24 Barangays</option>
                {barangays.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title or address…"
                className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('')
                    setFilterFor('')
                    setFilterBarangay('')
                    setSearchQuery('')
                  }}
                  className="py-3 rounded-xl border border-[var(--border)] font-bold text-sm"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm"
                >
                  Apply ({filteredListings.length})
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] mb-5">
          <span>
            {filteredListings.length}{' '}
            {filteredListings.length === 1 ? 'property' : 'properties'} found
          </span>
          {(filterType || filterFor || filterBarangay || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilterType('')
                setFilterFor('')
                setFilterBarangay('')
                setSearchQuery('')
              }}
              className="text-[var(--primary)] hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => (
              <PropertyCard key={item.id} property={item} showSaveButton />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <p className="font-bold text-base text-[var(--text)] mb-1">No listings match those filters</p>
            <p className="text-sm text-[var(--text-muted)]">Try choosing another barangay or clearing your search.</p>
          </div>
        )}
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#5B3A8E] text-[#FBF6F0] p-8 sm:p-14 text-center shadow-2xl border border-white/10">
          <h2 className="text-3xl sm:text-4xl font-black mb-3">Ready to Find Your Next Home?</h2>
          <p className="text-sm sm:text-base text-[#DDD0EA] max-w-xl mx-auto mb-8">
            Join verified buyers, tenants, and landowners finding trusted properties in Sta. Maria, Bulacan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/signup?role=buyer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#FF8A65] text-[#2B1B3D] font-extrabold text-sm hover:opacity-95 transition"
            >
              Sign Up as Buyer
            </Link>
            <Link
              href="/auth/signup?role=seller"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/30 bg-white/10 text-[#FBF6F0] font-extrabold text-sm hover:bg-white/20 transition"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
