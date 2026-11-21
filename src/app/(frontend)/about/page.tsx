import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { PublicFooter } from '@/components/kasafide/PublicFooter'
import { KasafideLogo } from '@/components/kasafide/KasafideLogo'
import { TeamGridClient } from './TeamGridClient'

export const metadata: Metadata = {
  title: 'About Us – Kasafide',
  description: 'Meet the PUP Sta. Maria founding team behind Kasafide, a verified housing platform built for trust.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar activePage="about" />
      <main className="flex-1 pt-24 pb-16">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-extrabold uppercase tracking-wider mb-4">
              Our Story
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--text)] leading-tight mb-4">
              We&apos;re just
              <br />
              <span className="text-[var(--primary)]">getting started.</span>
            </h1>
            <p className="text-base text-[var(--text-muted)] leading-relaxed">
              Kasafide is a verified web-based housing rental and property listing platform designed to connect genuine seekers directly with ID-verified property owners in Sta. Maria, Bulacan.
            </p>
          </div>
          <div className="lg:col-span-6 relative h-72 sm:h-96 rounded-3xl overflow-hidden border border-[var(--border)] shadow-xl">
            <Image
              src="/assets/img/house_image.jpg"
              alt="Verified Sta. Maria Property"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </section>

        {/* Origin Story */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--primary)]">
              Our Origin
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text)] mt-2 leading-tight">
              Born from frustration.
              <br />
              Built for <span className="text-[var(--primary)]">Trust.</span>
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-4 text-sm sm:text-base text-[var(--text-soft)] leading-relaxed">
            <p>
              The search for a home should be exciting, yet too often it is filled with anxiety. We developed Kasafide in direct response to a growing wave of misleading and unverified property listings on generic social marketplaces.
            </p>
            <blockquote className="p-5 rounded-2xl border-l-4 border-[var(--primary)] bg-[var(--surface)] font-semibold text-[var(--text)] italic">
              &ldquo;We realized the industry didn&apos;t just need another marketplace; it needed a fortress of accountability.&rdquo;
            </blockquote>
            <p>
              By making strict identity verification, Transfer Certificate of Title checks, barangay-level structured search, and secure in-platform communication our foundational pillars, Kasafide ensures what you see online matches reality.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7">
            <h3 className="text-xl font-black text-[var(--primary)] mb-2">Our Mission</h3>
            <p className="text-sm text-[var(--text-soft)] leading-relaxed">
              To provide a secure, transparent, and user-friendly housing rental and listing platform that prioritizes verified sellers, structured barangay information, and reliable communication.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7">
            <h3 className="text-xl font-black text-[var(--primary)] mb-2">Our Vision</h3>
            <p className="text-sm text-[var(--text-soft)] leading-relaxed">
              To become Bulacan&apos;s most trusted digital housing marketplace that enhances buyer confidence, promotes seller accountability, and modernizes local property discovery.
            </p>
          </div>
        </section>

        {/* Founding Team */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-[var(--text)]">Meet the Founding Team</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Hover or tap any card to flip and read each builder&apos;s role on Kasafide.
            </p>
          </div>
          <TeamGridClient />
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 text-center">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10">
            <div className="flex justify-center mb-4">
              <KasafideLogo size={40} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text)] mb-3">
              Your next home starts here.
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-6">
              Browse verified homes across Sta. Maria or register as a verified property owner today.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/browse"
                className="px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm"
              >
                Browse Listings
              </Link>
              <Link
                href="/auth/signup?role=seller"
                className="px-6 py-3 rounded-full border border-[var(--border)] font-extrabold text-sm"
              >
                List Your Property
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
