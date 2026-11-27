'use client'

import { useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toggleSavedListingAction } from '@/app/actions/kasafide'
import type { ListingCardView } from '@/lib/kasafide-data'

export function PropertyCard({
  property,
  detailHrefPrefix = '/listings',
  isSaved = false,
  showSaveButton = false,
}: {
  property: ListingCardView
  detailHrefPrefix?: string
  isSaved?: boolean
  showSaveButton?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const href = `${detailHrefPrefix}/${property.slug}`

  function onToggleSave(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const res = await toggleSavedListingAction(property.id)
      if (!res.ok) {
        router.push(`/auth/signin?redirect=${encodeURIComponent(href)}`)
        return
      }
      router.refresh()
    })
  }

  return (
    <article className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm hover:border-[var(--primary)] hover:-translate-y-1 transition duration-200 flex flex-col">
      <Link href={href} className="relative block h-52 w-full overflow-hidden bg-[var(--surface-soft)]">
        <Image
          src={property.coverUrl}
          alt={property.coverAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1230]/70 via-transparent to-transparent" />

        {/* Badge: For Rent / For Sale */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
            property.listingType === 'rent'
              ? 'bg-[#5B3A8E] text-[#FBF6F0]'
              : 'bg-[#FF8A65] text-[#2B1B3D]'
          }`}
        >
          {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
        </span>

        {/* Verified Badge */}
        {(property.titleVerified || property.sellerVerified) && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2B1B3D]/85 text-[#6FD394] text-[11px] font-bold backdrop-blur-sm">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Verified
          </span>
        )}

        {showSaveButton && (
          <button
            type="button"
            disabled={isPending}
            onClick={onToggleSave}
            data-tour="save-heart"
            aria-label={isSaved ? 'Remove from saved' : 'Save property'}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition cursor-pointer ${
              isSaved
                ? 'bg-[#FF8A65] border-[#FF8A65] text-[#2B1B3D]'
                : 'bg-[#2B1B3D]/70 border-white/20 text-[#FBF6F0] hover:bg-[#5B3A8E]'
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </Link>

      <div className="p-4.5 flex-1 flex flex-col">
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-xl font-extrabold text-[var(--primary)]">
            {property.priceFormatted}
          </span>
          {property.periodLabel && (
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {property.periodLabel}
            </span>
          )}
        </div>

        <Link href={href} className="font-bold text-[15px] text-[var(--text)] hover:text-[var(--primary)] line-clamp-1 mb-1">
          {property.title}
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="truncate">
            {property.barangayName}, {property.city}
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-[var(--border)]/60 flex items-center justify-between gap-2 text-xs text-[var(--text-soft)]">
          <div className="flex items-center gap-3">
            {property.bedrooms > 0 && (
              <span className="inline-flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 4v16" />
                  <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                  <path d="M2 17h20" />
                </svg>
                {property.bedrooms} bed{property.bedrooms === 1 ? '' : 's'}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="inline-flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5z" />
                  <path d="M6 12V5a2 2 0 0 1 2-2h2" />
                </svg>
                {property.bathrooms} bath
              </span>
            )}
            {property.lotAreaSqm > 0 && property.bedrooms === 0 && (
              <span>{property.lotAreaSqm} sqm lot</span>
            )}
          </div>
          <Link href={href} className="font-bold text-[var(--primary)] shrink-0">
            View details &rarr;
          </Link>
        </div>
      </div>
    </article>
  )
}
