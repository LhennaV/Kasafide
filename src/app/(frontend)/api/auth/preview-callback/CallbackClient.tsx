'use client'

import { useEffect, useState } from 'react'
import { completePreviewOAuthCallback } from '@/lib/preview-oauth-browser'

export default function CallbackClient({ rejectedQuery }: { rejectedQuery: boolean }) {
  const [status, setStatus] = useState<'working' | 'done' | 'error'>(
    rejectedQuery ? 'error' : 'working',
  )
  const [message, setMessage] = useState(
    rejectedQuery
      ? 'Open preview sign-in from the Kasafide app.'
      : 'Completing Google sign-in…',
  )

  useEffect(() => {
    if (rejectedQuery) return
    completePreviewOAuthCallback(async (callback) => {
      const response = await fetch('/api/auth/preview-complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ callback }),
      })
      if (!response.ok) {
        throw new Error('Preview sign-in failed')
      }
    })
      .then(() => {
        setStatus('done')
        setMessage('Signed in! Returning to Kasafide…')
        window.close()
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Preview sign-in failed')
      })
  }, [rejectedQuery])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#1E1230] text-[#FBF6F0]">
      <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-[#2B1B3D] p-7 text-center shadow-xl">
        <h1 className="text-lg font-extrabold mb-2">
          {status === 'error'
            ? 'Sign-In Incomplete'
            : status === 'done'
              ? 'Signed In'
              : 'Verifying Account…'}
        </h1>
        <p className="text-sm text-[#DDD0EA]">{message}</p>
      </div>
    </div>
  )
}
