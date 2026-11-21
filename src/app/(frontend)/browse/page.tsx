import type { Metadata } from 'next'
import { getCachedPublicMarketplace } from '@/lib/kasafide-data'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { BrowseCatalogClient } from '@/components/kasafide/BrowseCatalogClient'
import { PublicFooter } from '@/components/kasafide/PublicFooter'

export const metadata: Metadata = {
  title: 'Browse Verified Properties – Kasafide',
  description: 'Explore ID-verified houses, apartments, condos, commercial spaces, and titled lots in Sta. Maria, Bulacan.',
}

export default async function BrowsePage() {
  const { listings, barangays } = await getCachedPublicMarketplace()

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar activePage="browse" />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-7">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--primary)]">
            Sta. Maria, Bulacan
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text)] mt-1">
            Browse Properties
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Every property below has been reviewed by a Kasafide administrator and linked to an ID-verified seller.
          </p>
        </div>
        <BrowseCatalogClient listings={listings} barangays={barangays} />
      </main>
      <PublicFooter />
    </div>
  )
}
