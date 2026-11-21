import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCachedListingDetail, getCachedPublicMarketplace } from '@/lib/kasafide-data'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { ListingDetailClient } from '@/components/kasafide/ListingDetailClient'
import { PublicFooter } from '@/components/kasafide/PublicFooter'

export async function generateStaticParams() {
  try {
    const { listings } = await getCachedPublicMarketplace()
    return listings.map((l) => ({ slug: l.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getCachedListingDetail(slug)
  if (!data) return { title: 'Property Not Found – Kasafide' }
  return {
    title: `${data.listing.title} – Kasafide`,
    description: `${data.listing.priceFormatted}${data.listing.periodLabel} in Brgy. ${data.listing.barangayName}, Sta. Maria, Bulacan.`,
  }
}

export default async function PublicListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getCachedListingDetail(slug)
  if (!data) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar activePage="browse" />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="mb-5">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--primary)]"
          >
            &larr; Back to Browse Properties
          </Link>
        </div>
        <ListingDetailClient listing={data.listing} reviews={data.reviews} />
      </main>
      <PublicFooter />
    </div>
  )
}
