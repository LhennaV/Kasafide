'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSellerListingAction } from '@/app/actions/kasafide'

const AMENITY_OPTIONS = [
  '24/7 Gated Subdivision',
  'Covered Carport',
  'Flood-Free Area',
  'Own Meralco & Water Meter',
  'Fiber Internet Ready',
  'Pet Friendly',
]

export function SellerPostFormClient({
  barangays,
}: {
  barangays: Array<{ id: string; name: string }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [propertyType, setPropertyType] = useState<'house' | 'apartment' | 'condo' | 'commercial' | 'lot'>('house')
  const [listingType, setListingType] = useState<'rent' | 'sale'>('rent')
  const [price, setPrice] = useState('15000')
  const [barangayId, setBarangayId] = useState(barangays[0]?.id || '')
  const [address, setAddress] = useState('')
  const [bedrooms, setBedrooms] = useState('2')
  const [bathrooms, setBathrooms] = useState('1')
  const [floorAreaSqm, setFloorAreaSqm] = useState('65')
  const [lotAreaSqm, setLotAreaSqm] = useState('80')
  const [description, setDescription] = useState('')
  const [ownershipDocType, setOwnershipDocType] = useState<'tct' | 'deed_of_sale' | 'tax_declaration'>('tct')
  const [priceNegotiable, setPriceNegotiable] = useState(true)
  const [hasMultipleUnits, setHasMultipleUnits] = useState(false)
  const [totalUnits, setTotalUnits] = useState('1')
  const [amenities, setAmenities] = useState<string[]>(['Flood-Free Area', 'Own Meralco & Water Meter'])
  const [feedback, setFeedback] = useState<string | null>(null)

  function toggleAmenity(label: string) {
    setAmenities((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          const res = await createSellerListingAction({
            title,
            propertyType,
            listingType,
            price: Number(price),
            barangayId,
            address,
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            floorAreaSqm: Number(floorAreaSqm),
            lotAreaSqm: Number(lotAreaSqm),
            description,
            amenities,
            priceNegotiable,
            hasMultipleUnits,
            totalUnits: Number(totalUnits),
            ownershipDocType,
          })
          if (!res.ok) {
            setFeedback(res.error || 'Could not submit listing.')
            return
          }
          router.push('/module/seller/listings')
          router.refresh()
        })
      }}
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-5 max-w-3xl"
    >
      {feedback && (
        <div className="p-3.5 rounded-xl bg-[var(--danger)]/15 text-[var(--danger)] text-xs font-bold">
          {feedback}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold mb-1.5">Property Listing Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Modern 2BR Apartment near Poblacion Market"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold mb-1.5">Property Type</label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as typeof propertyType)}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          >
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="commercial">Commercial</option>
            <option value="lot">Lot Only</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5">Transaction</label>
          <select
            value={listingType}
            onChange={(e) => setListingType(e.target.value as typeof listingType)}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          >
            <option value="rent">For Rent (Monthly)</option>
            <option value="sale">For Sale</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5">Price (₱ PHP)</label>
          <input
            type="number"
            required
            min={500}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold mb-1.5">Barangay (Sta. Maria, Bulacan)</label>
          <select
            value={barangayId}
            onChange={(e) => setBarangayId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          >
            {barangays.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5">Street / Subdivision Address</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Block, Lot, Street Name"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-bold mb-1">Bedrooms</label>
          <input
            type="number"
            min={0}
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Bathrooms</label>
          <input
            type="number"
            min={0}
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Floor Area (sqm)</label>
          <input
            type="number"
            min={0}
            value={floorAreaSqm}
            onChange={(e) => setFloorAreaSqm(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Lot Area (sqm)</label>
          <input
            type="number"
            min={0}
            value={lotAreaSqm}
            onChange={(e) => setLotAreaSqm(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold mb-1.5">Ownership Proof Document Type</label>
        <select
          value={ownershipDocType}
          onChange={(e) => setOwnershipDocType(e.target.value as typeof ownershipDocType)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        >
          <option value="tct">Transfer Certificate of Title (TCT)</option>
          <option value="deed_of_sale">Notarized Deed of Absolute Sale</option>
          <option value="tax_declaration">Municipal Tax Declaration</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold mb-1.5">Property Description</label>
        <textarea
          rows={4}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe landmarks, utilities, flood elevation, and lease terms…"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold mb-2">Included Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => {
            const checked = amenities.includes(a)
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                  checked
                    ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                    : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)]'
                }`}
              >
                {checked ? `✓ ${a}` : a}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 text-xs font-bold">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={priceNegotiable}
            onChange={(e) => setPriceNegotiable(e.target.checked)}
          />
          <span>Price Negotiable</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasMultipleUnits}
            onChange={(e) => setHasMultipleUnits(e.target.checked)}
          />
          <span>Multi-Unit Building</span>
        </label>
        {hasMultipleUnits && (
          <input
            type="number"
            min={2}
            value={totalUnits}
            onChange={(e) => setTotalUnits(e.target.value)}
            placeholder="Total units"
            className="w-24 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)]"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer"
      >
        {isPending ? 'Submitting for Admin Review…' : 'Submit Listing for Admin Review'}
      </button>
    </form>
  )
}
