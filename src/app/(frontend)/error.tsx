'use client'

import { useRouter } from 'next/navigation'
import { signOutInPlace } from '@/lib/app-session-browser'

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-md w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-xl">
        <h1 className="text-xl font-extrabold mb-2">Something went wrong</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          {error.message || 'We ran into a temporary issue while rendering this page.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-sm cursor-pointer"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={async () => {
              await signOutInPlace(router).catch(() => null)
              reset()
            }}
            className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text)] font-semibold text-sm cursor-pointer"
          >
            Sign out &amp; retry
          </button>
        </div>
      </div>
    </div>
  )
}
