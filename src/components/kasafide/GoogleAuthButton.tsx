'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { announceSessionChange } from '@/lib/app-session-browser'
import { openPreviewOAuth, waitForPreviewOAuthSession } from '@/lib/preview-oauth-browser'

type PreviewOAuthWindow = Window & { __figmaPreviewOAuthPopupsAllowed?: boolean }

export function GoogleAuthButton({
  mode = 'signin',
  preferredRole = 'buyer',
  redirectTo,
}: {
  mode?: 'signin' | 'signup'
  preferredRole?: 'buyer' | 'seller'
  redirectTo?: string
}) {
  const router = useRouter()
  const pendingSignIn = useRef<AbortController | null>(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => () => pendingSignIn.current?.abort(), [])

  async function handleGoogleClick() {
    setErrorMsg(null)
    setBusy(true)

    // Store preferred role cookie so OAuth sync creates Buyer or Seller on first sign-up
    document.cookie = `kf_oauth_role=${preferredRole}; Path=/; Max-Age=600; SameSite=Lax; Secure`

    const win = window as PreviewOAuthWindow
    const isIframePreview =
      win.top !== win.self || typeof win.__figmaPreviewOAuthPopupsAllowed === 'boolean'

    if (isIframePreview) {
      pendingSignIn.current?.abort()
      const controller = (pendingSignIn.current = new AbortController())
      try {
        const secret = await openPreviewOAuth()
        const outcome = await waitForPreviewOAuthSession(secret, controller.signal)
        if (outcome === 'complete') {
          await announceSessionChange(router)
          router.push(
            redirectTo || (preferredRole === 'seller' ? '/module/seller' : '/module/buyer'),
          )
          return
        }
        if (outcome === 'expired') {
          setErrorMsg(
            'Google sign-in timed out or Google OAuth credentials are not configured yet. You can retry or sign in with email & password.',
          )
        }
      } catch (err) {
        setErrorMsg(
          err instanceof Error && err.message
            ? `${err.message}. Configure Google OAuth in the setup card or use email & password.`
            : 'Google preview sign-in is currently unavailable. Please use email & password or the published site.',
        )
      } finally {
        setBusy(false)
      }
      return
    }

    // Published standalone site uses Auth.js client helper directly
    try {
      await signIn('google', {
        redirectTo: redirectTo || (preferredRole === 'seller' ? '/module/seller' : '/module/buyer'),
      })
    } catch {
      setErrorMsg('Could not redirect to Google. Check your Google OAuth configuration.')
      setBusy(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={handleGoogleClick}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)] font-semibold text-sm transition cursor-pointer disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        <span>
          {busy
            ? 'Connecting to Google…'
            : mode === 'signup'
              ? 'Sign up with Google'
              : 'Sign in with Google'}
        </span>
      </button>
      {errorMsg && (
        <p className="mt-2 text-xs text-[var(--warning)] leading-relaxed text-center">{errorMsg}</p>
      )}
    </div>
  )
}
