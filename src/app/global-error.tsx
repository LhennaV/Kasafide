'use client'

import { signOut } from 'next-auth/react'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-[#1E1230] text-[#FBF6F0]">
        <div className="max-w-md w-full rounded-2xl border border-white/15 bg-[#2B1B3D] p-8 text-center">
          <h1 className="text-xl font-extrabold mb-2">Kasafide Recovery</h1>
          <p className="text-sm text-[#DDD0EA] mb-6">
            An unexpected application error occurred. You can retry or reset your session below.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-[#FF8A65] text-[#2B1B3D] font-bold text-sm cursor-pointer"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/app-auth/logout', { method: 'POST' }).catch(() => null)
                await signOut({ redirectTo: '/' })
              }}
              className="px-5 py-2.5 rounded-xl border border-white/20 text-[#FBF6F0] font-semibold text-sm cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
