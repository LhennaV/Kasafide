import { getCachedPublicMarketplace } from '@/lib/kasafide-data'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { LandingSections } from '@/components/kasafide/landing/LandingSections'

export default async function HomePage() {
  const { listings, barangays, stats } = await getCachedPublicMarketplace()

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar activePage="home" />
      <main className="flex-1">
        <LandingSections listings={listings} barangays={barangays} stats={stats} />
      </main>
    </div>
  )
}
