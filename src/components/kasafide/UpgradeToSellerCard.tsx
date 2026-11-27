import Link from 'next/link'

/** Buyer Profile & Account Settings: the way into Buyer → Seller (see /module/buyer/become-seller). */
export function UpgradeToSellerCard() {
  return (
    <div data-tour="upgrade-seller" className="rounded-3xl border border-[#FF8A65]/50 bg-gradient-to-br from-[#5B3A8E] to-[#7B54B3] text-[#FBF6F0] p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-black">Want to sell or rent out a property?</h2>
        <p className="text-sm opacity-90 mt-0.5">
          Upgrade this account to a Seller account. No new sign-up needed: your messages, payments and
          verification stay.
        </p>
      </div>
      <Link
        href="/module/buyer/become-seller"
        className="shrink-0 text-center px-6 py-3 rounded-xl bg-[#FF8A65] text-[#2B1B3D] font-black text-sm hover:brightness-105"
      >
        Upgrade to Seller
      </Link>
    </div>
  )
}
