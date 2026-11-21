'use client'

import { useState } from 'react'
import type { BarangayPinView, ListingCardView } from '@/lib/kasafide-data'
import { PropertyCard } from './PropertyCard'
import { StaMariaMapSection } from './StaMariaMapSection'

export function BrowseCatalogClient({
  listings,
  barangays,
  detailHrefPrefix = '/listings',
  savedIds = [],
}: {
  listings: ListingCardView[]
  barangays: BarangayPinView[]
  detailHrefPrefix?: string
  savedIds?: string[]
}) {
  const [type, setType] = useState('')
  const [listingFor, setListingFor] = useState('')
  const [barangay, setBarangay] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'newest'>(
    'recommended',
  )
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [sheetOpen, setSheetOpen] = useState(false)

  const filtered = listings
    .filter((l) => {
      if (type && l.propertyType !== type) return false
      if (listingFor && l.listingType !== listingFor) return false
      if (barangay && l.barangaySlug !== barangay) return false
      if (minPrice && l.price < Number(minPrice)) return false
      if (maxPrice && l.price > Number(maxPrice)) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (
          !l.title.toLowerCase().includes(q) &&
          !l.address.toLowerCase().includes(q) &&
          !l.barangayName.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return Number(b.featured) - Number(a.featured)
    })

  return (
    <div>
      <div className="flex md:hidden items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex-1 py-2.5 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-extrabold text-[var(--text)] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filters
        </button>
        <button
          type="button"
          onClick={() => setViewMode((m) => (m === 'grid' ? 'map' : 'grid'))}
          className="py-2.5 px-4 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold cursor-pointer"
        >
          {viewMode === 'grid' ? 'Map View' : 'Grid View'}
        </button>
      </div>

      <div className="hidden md:grid grid-cols-6 gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] mb-6">
        <select
          value={barangay}
          onChange={(e) => setBarangay(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        >
          <option value="">All Barangays</option>
          {barangays.map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        >
          <option value="">All Types</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
          <option value="commercial">Commercial</option>
          <option value="lot">Lot Only</option>
        </select>
        <select
          value={listingFor}
          onChange={(e) => setListingFor(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        >
          <option value="">Rent &amp; Sale</option>
          <option value="rent">For Rent</option>
          <option value="sale">For Sale</option>
        </select>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min ₱"
          className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max ₱"
          className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title…"
          className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        />
      </div>

      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end bg-black/60">
          <div className="w-full rounded-t-3xl bg-[var(--surface)] border-t border-[var(--border)] p-5 space-y-3 safe-bottom max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-base">Filter Properties</span>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="text-xs font-bold text-[var(--text-muted)]"
              >
                Close
              </button>
            </div>
            <select
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            >
              <option value="">All Barangays</option>
              {barangays.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            >
              <option value="">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="commercial">Commercial</option>
              <option value="lot">Lot Only</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ₱"
                className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ₱"
                className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or address…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setBarangay('')
                  setType('')
                  setListingFor('')
                  setMinPrice('')
                  setMaxPrice('')
                  setSearch('')
                }}
                className="py-2.5 rounded-xl border border-[var(--border)] text-sm font-bold"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-sm font-extrabold"
              >
                Show {filtered.length}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <span className="text-sm font-bold text-[var(--text-muted)]">
          Showing <strong className="text-[var(--text)]">{filtered.length}</strong> verified properties
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'grid' ? 'map' : 'grid'))}
            className="hidden md:inline-flex px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-bold text-[var(--text)] hover:border-[var(--primary)] cursor-pointer"
          >
            {viewMode === 'grid' ? 'Explore Barangay Map' : 'Back to Cards'}
          </button>
          <select
            aria-label="Sort listings"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-bold text-[var(--text)]"
          >
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {viewMode === 'map' ? (
        <StaMariaMapSection
          barangays={barangays}
          onSelectBarangay={(slug) => {
            setBarangay(slug)
            setViewMode('grid')
          }}
        />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <PropertyCard
              key={item.id}
              property={item}
              detailHrefPrefix={detailHrefPrefix}
              showSaveButton
              isSaved={savedIds.includes(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <div className="font-extrabold text-base mb-1">No listings found</div>
          <p className="text-sm text-[var(--text-muted)]">Try resetting or broadening your price and barangay filters.</p>
        </div>
      )}
    </div>
  )
}
