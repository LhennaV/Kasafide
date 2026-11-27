'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSellerListingAction } from '@/app/actions/kasafide'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { uploadFile } from '@/lib/upload-client'

const MAX_PHOTOS = 10

type Photo = { url: string; preview: string }

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
  const [photos, setPhotos] = useState<Photo[]>([])
  const [ownershipDoc, setOwnershipDoc] = useState<{ path: string; name: string } | null>(null)
  const [uploading, setUploading] = useState<'' | 'photos' | 'doc'>('')
  const [submitted, setSubmitted] = useState(false)

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return
    setFeedback(null)
    setUploading('photos')
    const room = MAX_PHOTOS - photos.length
    for (const file of Array.from(files).slice(0, room)) {
      const res = await uploadFile('listing-photo', file)
      if (!res.ok || !res.url) {
        setFeedback(res.ok ? 'Upload failed.' : res.error)
        break
      }
      const url = res.url
      setPhotos((prev) => [...prev, { url, preview: URL.createObjectURL(file) }])
    }
    if (files.length > room) setFeedback(`Up to ${MAX_PHOTOS} photos per listing.`)
    setUploading('')
  }

  async function attachDoc(file: File | undefined) {
    if (!file) return
    setFeedback(null)
    setUploading('doc')
    const res = await uploadFile('ownership-doc', file)
    setUploading('')
    if (!res.ok) return setFeedback(res.error)
    setOwnershipDoc({ path: res.path, name: file.name })
  }

  function toggleAmenity(label: string) {
    setAmenities((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (photos.length === 0) {
          setFeedback('Please attach at least one photo of the property.')
          return
        }
        if (!ownershipDoc) {
          setFeedback('Please attach your ownership document (title, deed of sale, or tax declaration).')
          return
        }
        setFeedback(null)
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
            photoUrls: photos.map((p) => p.url),
            ownershipDocPath: ownershipDoc.path,
          }).catch(() => ({ ok: false, error: 'Could not reach the server. Please try again.' }))
          if (!res.ok) {
            setFeedback(res.error || 'Could not submit listing.')
            return
          }
          setSubmitted(true)
        })
      }}
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-5 w-full"
    >
      <Dialog
        open={submitted}
        onOpenChange={(open) => {
          if (!open) {
            router.push('/module/seller/listings')
            router.refresh()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Listing submitted!</DialogTitle>
            <DialogDescription>
              &ldquo;{title}&rdquo; was sent to a Kasafide administrator. They will check your photos and
              ownership document, and the listing goes live once it&apos;s approved. You&apos;ll get a
              notification either way.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                router.push('/module/seller/listings')
                router.refresh()
              }}
              className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer"
            >
              Go to My Listings
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        <label
          className={`mt-2 flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition ${
            ownershipDoc
              ? 'border-[var(--success)] bg-[var(--success)]/10'
              : 'border-[var(--border)] hover:border-[var(--primary)]'
          }`}
        >
          <input
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            disabled={uploading !== ''}
            onChange={(e) => {
              void attachDoc(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          <span className="text-xs font-bold min-w-0 truncate">
            {uploading === 'doc'
              ? 'Uploading document…'
              : ownershipDoc
                ? `✓ ${ownershipDoc.name} · tap to replace`
                : 'Attach a scan or photo of the document (JPG, PNG or PDF, max 5 MB)'}
          </span>
        </label>
        <p className="text-[11px] text-[var(--text-muted)] mt-1">
          Only Kasafide administrators can open this file. It is never shown on the public listing.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold mb-1.5">
          Property Photos ({photos.length}/{MAX_PHOTOS}) &middot; the first photo is the cover
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photos.map((p, i) => (
            <div
              key={p.url}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-soft)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview blob */}
              <img src={p.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 px-1.5 py-0.5 rounded-md bg-[var(--primary)] text-[var(--on-primary)] text-[10px] font-black">
                  Cover
                </span>
              )}
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => setPhotos((prev) => prev.filter((x) => x.url !== p.url))}
                className="absolute right-1 top-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-black cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="aspect-[4/3] rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] flex flex-col items-center justify-center text-center text-[var(--text-muted)] cursor-pointer p-2">
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={uploading !== ''}
                onChange={(e) => {
                  void addPhotos(e.target.files)
                  e.target.value = ''
                }}
              />
              <span className="text-2xl leading-none">+</span>
              <span className="text-[11px] font-bold mt-1">
                {uploading === 'photos' ? 'Uploading…' : 'Add photos'}
              </span>
            </label>
          )}
        </div>
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

      {/* Next to the button: on a long form a message at the top would be off-screen. */}
      {feedback && (
        <div role="alert" className="p-3.5 rounded-xl bg-[var(--danger)]/15 text-[var(--danger)] text-xs font-bold">
          {feedback}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || uploading !== '' || submitted}
        className="w-full py-3.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Submitting for Admin Review…' : 'Submit Listing for Admin Review'}
      </button>
    </form>
  )
}
