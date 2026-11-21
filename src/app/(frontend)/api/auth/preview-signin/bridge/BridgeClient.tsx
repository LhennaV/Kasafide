'use client'

import { useEffect, useState } from 'react'
import { startPreviewOAuthBridge } from '@/lib/preview-oauth-browser'

export default function BridgeClient({ bootstrapCsrf }: { bootstrapCsrf: string }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!bootstrapCsrf) {
      setErrorMessage('Open preview sign-in from the Kasafide sign-in button.')
      return
    }
    startPreviewOAuthBridge(async (secret) => {
      const response = await fetch('/api/auth/preview-start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ secret, csrf: bootstrapCsrf }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error || 'Preview sign-in unavailable')
      }
      const data = (await response.json()) as { authorizationUrl: string }
      return data.authorizationUrl
    }).catch((err) => {
      setErrorMessage(err instanceof Error ? err.message : 'Preview sign-in could not start.')
    })
  }, [bootstrapCsrf])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#1E1230] text-[#FBF6F0]">
      <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-[#2B1B3D] p-7 text-center shadow-xl">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-[#FF8A65]/20 flex items-center justify-center text-[#FF8A65] font-extrabold">
          K
        </div>
        <h1 className="text-lg font-extrabold mb-2">
          {errorMessage ? 'Google Sign-In Notice' : 'Connecting to Google…'}
        </h1>
        <p className="text-sm text-[#DDD0EA]">
          {errorMessage || 'Preparing secure Kasafide preview authentication.'}
        </p>
      </div>
    </div>
  )
}
