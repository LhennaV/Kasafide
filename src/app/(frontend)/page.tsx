import { getCachedPublicMarketplace } from '@/lib/kasafide-data'
import { PublicNavbar } from '@/components/kasafide/PublicNavbar'
import { HomeLandingClient } from '@/components/kasafide/HomeLandingClient'
import { PublicFooter } from '@/components/kasafide/PublicFooter'

export default async function HomePage() {
  const { listings, barangays, stats } = await getCachedPublicMarketplace()

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar activePage="home" />
      <main className="flex-1">
        <HomeLandingClient listings={listings} barangays={barangays} stats={stats} />
      </main>
      <PublicFooter />
    </div>
  )
}
