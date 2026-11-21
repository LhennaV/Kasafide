import { unstable_cache } from 'next/cache'
import { findBySlug, getPayloadClient } from '@/lib/payload'
import { formatPeso } from '@/lib/format'
import type { Barangay, Listing, Media, Review, User } from '@/payload-types'

export { formatPeso }

export type ListingCardView = {
  id: string
  slug: string
  title: string
  propertyType: 'house' | 'apartment' | 'condo' | 'commercial' | 'lot'
  listingType: 'rent' | 'sale'
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'closed'
  price: number
  priceFormatted: string
  periodLabel: string
  barangayName: string
  barangaySlug: string
  address: string
  city: string
  province: string
  bedrooms: number
  bathrooms: number
  floorAreaSqm: number
  lotAreaSqm: number
  description: string
  coverUrl: string
  coverAlt: string
  gallery: Array<{ url: string; alt: string; caption?: string }>
  amenities: string[]
  featured: boolean
  titleVerified: boolean
  priceNegotiable: boolean
  hasMultipleUnits: boolean
  totalUnits: number
  availableUnits: number
  ownershipDocType: string
  sellerId: string
  sellerName: string
  sellerVerified: boolean
  createdAt: string
}

export type BarangayPinView = {
  id: string
  name: string
  slug: string
  mapX: number
  mapY: number
  featuredDescription: string
  listingCount: number
}

export function mapListingDoc(doc: Listing): ListingCardView {
  const brgy = typeof doc.barangay === 'object' && doc.barangay ? (doc.barangay as Barangay) : null
  const seller = typeof doc.seller === 'object' && doc.seller ? (doc.seller as User) : null
  const cover =
    typeof doc.coverImage === 'object' && doc.coverImage ? (doc.coverImage as Media) : null

  const galleryItems = (doc.gallery ?? [])
    .map((item) => {
      const img = typeof item.image === 'object' && item.image ? (item.image as Media) : null
      if (!img?.url) return null
      return {
        url: img.url,
        alt: img.alt || doc.title,
        caption: item.caption || undefined,
      }
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))

  const coverUrl = cover?.url || '/assets/img/house_image.jpg'
  const coverAlt = cover?.alt || doc.title

  return {
    id: String(doc.id),
    slug: doc.slug || String(doc.id),
    title: doc.title,
    propertyType: doc.propertyType,
    listingType: doc.listingType,
    status: doc.status,
    price: Number(doc.price) || 0,
    priceFormatted: formatPeso(doc.price),
    periodLabel: doc.listingType === 'rent' ? '/month' : '',
    barangayName: brgy?.name || 'Sta. Maria',
    barangaySlug: brgy?.slug || 'poblacion',
    address: doc.address,
    city: doc.city || 'Sta. Maria',
    province: doc.province || 'Bulacan',
    bedrooms: Number(doc.bedrooms) || 0,
    bathrooms: Number(doc.bathrooms) || 0,
    floorAreaSqm: Number(doc.floorAreaSqm) || 0,
    lotAreaSqm: Number(doc.lotAreaSqm) || 0,
    description: doc.description,
    coverUrl,
    coverAlt,
    gallery: galleryItems.length ? galleryItems : [{ url: coverUrl, alt: coverAlt }],
    amenities: (doc.amenities ?? []).map((a) => a.label).filter(Boolean),
    featured: Boolean(doc.featured),
    titleVerified: Boolean(doc.titleVerified),
    priceNegotiable: Boolean(doc.priceNegotiable),
    hasMultipleUnits: Boolean(doc.hasMultipleUnits),
    totalUnits: Number(doc.totalUnits) || 1,
    availableUnits: doc.availableUnits ?? 1,
    ownershipDocType: doc.ownershipDocType || 'tct',
    sellerId: seller ? String(seller.id) : String(doc.seller || ''),
    sellerName: seller?.fullName || 'Verified Kasafide Owner',
    sellerVerified: seller ? seller.accountStatus === 'verified' : Boolean(doc.titleVerified),
    createdAt: doc.createdAt,
  }
}

export const getCachedPublicMarketplace = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const [listingsRes, barangaysRes, sellersCountRes] = await Promise.all([
      payload.find({
        collection: 'listings',
        overrideAccess: false,
        where: { status: { equals: 'approved' } },
        depth: 2,
        limit: 100,
        sort: '-featured,-createdAt',
      }),
      payload.find({
        collection: 'barangays',
        overrideAccess: false,
        depth: 0,
        limit: 50,
        sort: 'name',
      }),
      payload.count({
        collection: 'users',
        overrideAccess: false,
        where: {
          and: [{ role: { equals: 'seller' } }, { accountStatus: { equals: 'verified' } }],
        },
      }),
    ])

    const listings = listingsRes.docs.map(mapListingDoc)
    const countsByBarangaySlug: Record<string, number> = {}
    for (const item of listings) {
      countsByBarangaySlug[item.barangaySlug] = (countsByBarangaySlug[item.barangaySlug] || 0) + 1
    }

    const barangays: BarangayPinView[] = barangaysRes.docs.map((b) => ({
      id: String(b.id),
      name: b.name,
      slug: b.slug || b.name.toLowerCase().replace(/\s+/g, '-'),
      mapX: b.mapX,
      mapY: b.mapY,
      featuredDescription: b.featuredDescription || '',
      listingCount: countsByBarangaySlug[b.slug || ''] || 0,
    }))

    return {
      listings,
      barangays,
      stats: {
        barangaysCovered: barangays.length || 24,
        listingsLive: listings.length,
        verifiedSellers: sellersCountRes.totalDocs,
        unverifiedListings: 0,
      },
    }
  },
  ['kasafide-public-marketplace'],
  {
    tags: ['listings', 'barangays', 'media', 'public-stats'],
  },
)

export function getCachedListingDetail(slug: string) {
  return unstable_cache(
    async () => {
      const doc = await findBySlug('listings', slug, { depth: 2 })
      if (!doc || doc.status !== 'approved') return null
      const payload = await getPayloadClient()
      const reviewsRes = await payload.find({
        collection: 'reviews',
        overrideAccess: false,
        where: { listing: { equals: doc.id } },
        depth: 1,
        limit: 20,
        sort: '-createdAt',
      })
      const reviews = reviewsRes.docs.map((r: Review) => {
        const reviewer =
          typeof r.reviewer === 'object' && r.reviewer ? (r.reviewer as User) : null
        return {
          id: String(r.id),
          rating: r.rating,
          comment: r.comment,
          reviewerName: reviewer?.fullName || 'Verified Kasafide Member',
          createdAt: r.createdAt,
        }
      })
      return {
        listing: mapListingDoc(doc),
        reviews,
      }
    },
    ['kasafide-listing-detail', slug],
    {
      tags: ['listings', `listing:${slug}`, 'reviews', 'media'],
    },
  )()
}
