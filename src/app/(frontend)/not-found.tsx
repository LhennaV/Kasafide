import Link from "next/link"
import { KasafideLogo } from "@/components/kasafide/KasafideLogo"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center bg-[var(--bg)] text-[var(--text)]">
      <KasafideLogo size={46} className="mb-4" />
      <h1 className="text-3xl font-black tracking-tight">Property or Page Not Found</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        This listing may still be under Kasafide Admin verification, closed, or moved.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm"
          href="/"
        >
          &larr; Back to Home
        </Link>
        <Link
          className="px-6 py-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] font-bold text-sm"
          href="/browse"
        >
          Browse Verified Listings
        </Link>
      </div>
    </main>
  )
}
