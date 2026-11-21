'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  sendMessageAction,
  submitListingReportAction,
  submitPaymentAction,
  submitReviewAction,
  submitViewingRequestAction,
  toggleSavedListingAction,
} from '@/app/actions/kasafide'
import type { ListingCardView } from '@/lib/kasafide-data'

type ReviewView = {
  id: string
  rating: number
  comment: string
  reviewerName: string
  createdAt: string
}

export function ListingDetailClient({
  listing,
  reviews,
  initialSaved = false,
  inPortal = false,
}: {
  listing: ListingCardView
  reviews: ReviewView[]
  initialSaved?: boolean
  inPortal?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activePhoto, setActivePhoto] = useState(0)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [viewingOpen, setViewingOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  const [viewDate, setViewDate] = useState('2026-06-20')
  const [viewTime, setViewTime] = useState('10:00 AM')
  const [viewNotes, setViewNotes] = useState('')
  const [msgText, setMsgText] = useState(
    `Hi ${listing.sellerName}, is "${listing.title}" still available?`,
  )
  const [payType, setPayType] = useState<'rent' | 'reservation' | 'security_deposit'>('reservation')
  const [payMethod, setPayMethod] = useState<'qrph' | 'gcash' | 'maya'>('gcash')
  const [payRef, setPayRef] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reportReason, setReportReason] = useState<
    'fake_listing' | 'misleading_photos' | 'wrong_price' | 'scam_behavior' | 'duplicate'
  >('wrong_price')
  const [reportDetails, setReportDetails] = useState('')

  const currentImage = listing.gallery[activePhoto] || {
    url: listing.coverUrl,
    alt: listing.coverAlt,
  }

  function handleAuthRequired(errText?: string) {
    if (errText && errText.toLowerCase().includes('sign in')) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(`/module/buyer/listing/${listing.slug}`)}`)
      return true
    }
    return false
  }

  return (
    <div className="pb-24 md:pb-8">
      {feedback && (
        <div
          className={`mb-5 p-4 rounded-2xl border text-sm font-semibold ${
            feedback.type === 'ok'
              ? 'bg-[var(--success)]/12 border-[var(--success)]/40 text-[var(--success)]'
              : 'bg-[var(--danger)]/12 border-[var(--danger)]/40 text-[var(--danger)]'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            <div className="relative h-72 sm:h-[420px] w-full bg-[var(--surface-soft)]">
              <Image
                src={currentImage.url}
                alt={currentImage.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3.5 py-1 rounded-full bg-[#5B3A8E] text-[#FBF6F0] text-xs font-extrabold uppercase">
                  {listing.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
                {listing.titleVerified && (
                  <span className="px-3.5 py-1 rounded-full bg-[#2B1B3D]/90 text-[#6FD394] text-xs font-extrabold inline-flex items-center gap-1">
                    ✓ Title &amp; Owner Verified
                  </span>
                )}
              </div>
            </div>

            {listing.gallery.length > 1 && (
              <div className="flex gap-2.5 p-3 overflow-x-auto border-t border-[var(--border)]">
                {listing.gallery.map((img, i) => (
                  <button
                    key={img.url + i}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                      i === activePhoto ? 'border-[var(--primary)]' : 'border-transparent opacity-70'
                    }`}
                  >
                    <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary)]">
                  Brgy. {listing.barangayName}, {listing.city}, {listing.province}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)] mt-1">
                  {listing.title}
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">{listing.address}</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-3xl font-black text-[var(--primary)]">
                  {listing.priceFormatted}
                  <span className="text-sm font-semibold text-[var(--text-muted)]">
                    {listing.periodLabel}
                  </span>
                </div>
                {listing.priceNegotiable && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold">
                    Price Negotiable
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-[var(--border)]">
              <div className="p-3 rounded-2xl bg-[var(--surface-soft)]">
                <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Type</div>
                <div className="text-sm font-extrabold capitalize mt-0.5">{listing.propertyType}</div>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--surface-soft)]">
                <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Bedrooms</div>
                <div className="text-sm font-extrabold mt-0.5">
                  {listing.bedrooms > 0 ? `${listing.bedrooms} Bed` : 'Lot / Open'}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--surface-soft)]">
                <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Bathrooms</div>
                <div className="text-sm font-extrabold mt-0.5">
                  {listing.bathrooms > 0 ? `${listing.bathrooms} Bath` : 'N/A'}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--surface-soft)]">
                <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Area</div>
                <div className="text-sm font-extrabold mt-0.5">
                  {listing.floorAreaSqm > 0
                    ? `${listing.floorAreaSqm} sqm floor`
                    : `${listing.lotAreaSqm} sqm lot`}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h2 className="font-extrabold text-base text-[var(--text)] mb-2">About This Property</h2>
              <p className="text-sm text-[var(--text-soft)] leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {listing.amenities.length > 0 && (
              <div className="mt-6">
                <h2 className="font-extrabold text-base text-[var(--text)] mb-3">Amenities &amp; Highlights</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span
                      key={a}
                      className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-bold text-[var(--text)]"
                    >
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="font-extrabold text-lg text-[var(--text)] mb-4">
              Verified Buyer &amp; Tenant Reviews ({reviews.length})
            </h2>
            {reviews.length > 0 ? (
              <div className="space-y-3 mb-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-[var(--surface-soft)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[var(--text)]">{rev.reviewerName}</span>
                      <span className="text-xs font-extrabold text-[#F4BC5C]">
                        {'★'.repeat(rev.rating)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-soft)]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] mb-5">
                No reviews posted yet for this property.
              </p>
            )}

            <div className="pt-4 border-t border-[var(--border)] space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Share Your Viewing or Rental Feedback
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold">Rating:</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs font-bold"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Stars
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write an honest review about the property and seller…"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await submitReviewAction({
                      listingId: listing.id,
                      sellerId: listing.sellerId,
                      rating: reviewRating,
                      comment: reviewComment,
                    })
                    if (!res.ok) {
                      if (!handleAuthRequired(res.error)) {
                        setFeedback({ type: 'err', text: res.error || 'Failed to submit review.' })
                      }
                      return
                    }
                    setReviewComment('')
                    setFeedback({ type: 'ok', text: res.message || 'Review posted!' })
                    router.refresh()
                  })
                }}
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold cursor-pointer"
              >
                Post Verified Review
              </button>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-md">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#5B3A8E] text-[#FBF6F0] font-black flex items-center justify-center text-base">
                {listing.sellerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-extrabold text-base text-[var(--text)]">
                  {listing.sellerName}
                </div>
                <div className="text-xs font-bold text-[var(--success)]">
                  ✓ Government ID &amp; MOA Verified Seller
                </div>
              </div>
            </div>

            {listing.hasMultipleUnits && (
              <div className="mb-4 p-3 rounded-2xl bg-[var(--surface-soft)] flex items-center justify-between text-xs font-bold">
                <span>Units Available</span>
                <span className="text-[var(--primary)]">
                  {listing.availableUnits} of {listing.totalUnits} open
                </span>
              </div>
            )}

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setViewingOpen(true)}
                className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer hover:opacity-95 transition"
              >
                Schedule Viewing
              </button>

              <button
                type="button"
                onClick={() => setMessageOpen(true)}
                className="w-full py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)] font-bold text-sm cursor-pointer hover:border-[var(--primary)] transition"
              >
                Message Seller
              </button>

              <button
                type="button"
                onClick={() => setPaymentOpen(true)}
                className="w-full py-3 rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)] font-extrabold text-sm cursor-pointer hover:bg-[var(--primary)]/20 transition"
              >
                Pay via QR Ph / GCash / Maya
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await toggleSavedListingAction(listing.id)
                    if (!res.ok) {
                      handleAuthRequired(res.error)
                      return
                    }
                    setFeedback({ type: 'ok', text: res.message || 'Updated saved status.' })
                    router.refresh()
                  })
                }}
                className="w-full py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-soft)] cursor-pointer"
              >
                {initialSaved ? '♥ Saved in Shortlist' : '♡ Save Property'}
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Doc Checked: {listing.ownershipDocType.toUpperCase()}</span>
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="text-[var(--danger)] font-semibold hover:underline cursor-pointer"
              >
                Report Listing
              </button>
            </div>
          </div>

          {!inPortal && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs text-[var(--text-soft)] leading-relaxed">
              Want full buyer dashboard tracking for saved homes, chat threads, and payment receipts?{' '}
              <Link href="/auth/signin" className="font-extrabold text-[var(--primary)] underline">
                Sign in to your Buyer Portal
              </Link>
              .
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--border)] p-3 safe-bottom flex items-center gap-2">
        <div className="pr-2">
          <div className="text-sm font-black text-[var(--primary)]">{listing.priceFormatted}</div>
          <div className="text-[10px] text-[var(--text-muted)]">{listing.periodLabel || 'Verified'}</div>
        </div>
        <button
          type="button"
          onClick={() => setMessageOpen(true)}
          className="flex-1 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-bold"
        >
          Message
        </button>
        <button
          type="button"
          onClick={() => setViewingOpen(true)}
          className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold"
        >
          Book Viewing
        </button>
      </div>

      {viewingOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4 safe-bottom">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg">Schedule Property Viewing</h3>
              <button type="button" onClick={() => setViewingOpen(false)} className="text-sm font-bold">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={viewDate}
                  onChange={(e) => setViewDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Preferred Time</label>
                <select
                  value={viewTime}
                  onChange={(e) => setViewTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
                >
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>01:30 PM</option>
                  <option>03:30 PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Notes for Owner</label>
              <textarea
                rows={3}
                value={viewNotes}
                onChange={(e) => setViewNotes(e.target.value)}
                placeholder="Questions or companions attending viewing…"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const res = await submitViewingRequestAction({
                    listingId: listing.id,
                    sellerId: listing.sellerId,
                    preferredDate: viewDate,
                    preferredTime: viewTime,
                    notes: viewNotes,
                  })
                  if (!res.ok) {
                    if (!handleAuthRequired(res.error)) {
                      setFeedback({ type: 'err', text: res.error || 'Could not book viewing.' })
                    }
                    return
                  }
                  setViewingOpen(false)
                  setFeedback({ type: 'ok', text: res.message || 'Viewing requested!' })
                  router.refresh()
                })
              }}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer"
            >
              Send Viewing Request
            </button>
          </div>
        </div>
      )}

      {messageOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4 safe-bottom">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg">Message {listing.sellerName}</h3>
              <button type="button" onClick={() => setMessageOpen(false)} className="text-sm font-bold">
                ✕
              </button>
            </div>
            <textarea
              rows={4}
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const res = await sendMessageAction({
                    recipientId: listing.sellerId,
                    listingId: listing.id,
                    body: msgText,
                  })
                  if (!res.ok) {
                    if (!handleAuthRequired(res.error)) {
                      setFeedback({ type: 'err', text: res.error || 'Could not send message.' })
                    }
                    return
                  }
                  setMessageOpen(false)
                  setFeedback({ type: 'ok', text: 'Message sent! Open Messages in your portal to view replies.' })
                  router.refresh()
                })
              }}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer"
            >
              Send Secure Message
            </button>
          </div>
        </div>
      )}

      {paymentOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4 safe-bottom">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg">Kasafide Protected Payment</h3>
              <button type="button" onClick={() => setPaymentOpen(false)} className="text-sm font-bold">
                ✕
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Amounts are computed server-side from the verified listing price so buyers and sellers have an accurate audit record.
            </p>
            <div>
              <label className="block text-xs font-bold mb-1">Payment Purpose</label>
              <select
                value={payType}
                onChange={(e) => setPayType(e.target.value as typeof payType)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              >
                <option value="reservation">Reservation Hold (25% / max ₱5,000)</option>
                <option value="rent">1 Month Rent / Full Listed Amount ({listing.priceFormatted})</option>
                <option value="security_deposit">2-Month Security Deposit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Payment Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {(['gcash', 'maya', 'qrph'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayMethod(m)}
                    className={`py-2.5 rounded-xl border text-xs font-extrabold uppercase cursor-pointer ${
                      payMethod === m
                        ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                        : 'border-[var(--border)] bg-[var(--bg)]'
                    }`}
                  >
                    {m === 'qrph' ? 'QR Ph' : m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Reference Last 6 Digits (GCash/Maya)</label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. 849201"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const res = await submitPaymentAction({
                    listingId: listing.id,
                    payeeId: listing.sellerId,
                    paymentType: payType,
                    method: payMethod,
                    periodLabel: 'July 2026',
                    referenceSuffix: payRef,
                  })
                  if (!res.ok) {
                    if (!handleAuthRequired(res.error)) {
                      setFeedback({ type: 'err', text: res.error || 'Payment failed.' })
                    }
                    return
                  }
                  setPaymentOpen(false)
                  setFeedback({ type: 'ok', text: res.message || 'Payment recorded!' })
                  router.refresh()
                })
              }}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer"
            >
              Submit Payment Record
            </button>
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4 safe-bottom">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-[var(--danger)]">Report This Listing</h3>
              <button type="button" onClick={() => setReportOpen(false)} className="text-sm font-bold">
                ✕
              </button>
            </div>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as typeof reportReason)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            >
              <option value="fake_listing">Suspected Fake / Non-Existent Property</option>
              <option value="misleading_photos">Misleading Photos or Address</option>
              <option value="wrong_price">Inaccurate Price / Hidden Charges</option>
              <option value="scam_behavior">Off-Platform Scam Attempt</option>
              <option value="duplicate">Duplicate / Outdated Listing</option>
            </select>
            <textarea
              rows={3}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Provide details for Kasafide Trust & Safety admins…"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const res = await submitListingReportAction({
                    listingId: listing.id,
                    reason: reportReason,
                    details: reportDetails,
                  })
                  if (!res.ok) {
                    if (!handleAuthRequired(res.error)) {
                      setFeedback({ type: 'err', text: res.error || 'Could not submit report.' })
                    }
                    return
                  }
                  setReportOpen(false)
                  setReportDetails('')
                  setFeedback({ type: 'ok', text: res.message || 'Report submitted.' })
                })
              }}
              className="w-full py-3 rounded-xl bg-[var(--danger)] text-white font-extrabold text-sm cursor-pointer"
            >
              Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
