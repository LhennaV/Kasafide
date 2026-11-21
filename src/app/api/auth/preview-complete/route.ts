import { cookies } from 'next/headers'
import {
  getPreviewOAuthStore,
  getTrustedSandboxOrigin,
  isPreviewOAuthPost,
  readPreviewOAuthCallback,
} from '@/lib/preview-oauth-server'
import { syncGoogleUserToPayload } from '@/lib/oauth-user-sync'

function clearFlowCookies(headers: Headers) {
  headers.append(
    'set-cookie',
    '__Host-pv_handle=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0',
  )
  headers.append(
    'set-cookie',
    '__Host-pv_nonce=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0',
  )
}

export async function POST(request: Request) {
  const headers = new Headers({
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
    'content-type': 'application/json',
  })

  const trustedOrigin = getTrustedSandboxOrigin()
  if (!trustedOrigin || !isPreviewOAuthPost(request, trustedOrigin)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers })
  }

  const rawBody = await request.json().catch(() => null)
  const params = readPreviewOAuthCallback(rawBody)
  if (!params) {
    clearFlowCookies(headers)
    return new Response(JSON.stringify({ error: 'Invalid callback payload' }), {
      status: 400,
      headers,
    })
  }

  const cookieStore = await cookies()
  const handle = cookieStore.get('__Host-pv_handle')?.value
  const popupNonceCookie = cookieStore.get('__Host-pv_nonce')?.value
  const preferredRoleCookie = cookieStore.get('kf_oauth_role')?.value
  const state = params.get('state') || ''
  const stateNonce = state.split('.')[3] || ''

  const store = getPreviewOAuthStore()
  if (!handle) {
    clearFlowCookies(headers)
    return new Response(JSON.stringify({ error: 'Missing preview handle' }), {
      status: 400,
      headers,
    })
  }

  const verifier = store.takeCallback(handle, stateNonce, popupNonceCookie)
  if (!verifier) {
    clearFlowCookies(headers)
    return new Response(JSON.stringify({ error: 'Callback verification failed' }), {
      status: 400,
      headers,
    })
  }

  clearFlowCookies(headers)

  const providerError = params.get('error')
  const code = params.get('code')
  const redirectUri = process.env.FIGMA_PREVIEW_OAUTH_REDIRECT_URI
  const clientId = process.env.AUTH_GOOGLE_ID
  const clientSecret = process.env.AUTH_GOOGLE_SECRET

  if (providerError || !code || !redirectUri || !clientId || !clientSecret) {
    console.error(
      'Preview OAuth complete failed:',
      providerError || 'Missing code or Google provider credentials',
    )
    store.fail(handle)
    return new Response(JSON.stringify({ error: 'OAuth provider returned an error' }), {
      status: 400,
      headers,
    })
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: verifier,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`Google token exchange failed with status ${tokenResponse.status}`)
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string }
    if (!tokenData.access_token) {
      throw new Error('Google token response omitted access_token')
    }

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    if (!profileResponse.ok) {
      throw new Error(`Google userinfo request failed with status ${profileResponse.status}`)
    }

    const profile = (await profileResponse.json()) as {
      sub?: unknown
      email?: unknown
      name?: unknown
      given_name?: unknown
      family_name?: unknown
      picture?: unknown
    }

    if (typeof profile.sub !== 'string' || !profile.sub) {
      throw new Error('Google userinfo response omitted sub')
    }

    const synced = await syncGoogleUserToPayload({
      providerId: profile.sub,
      email: typeof profile.email === 'string' ? profile.email : null,
      name: typeof profile.name === 'string' ? profile.name : null,
      givenName: typeof profile.given_name === 'string' ? profile.given_name : null,
      familyName: typeof profile.family_name === 'string' ? profile.family_name : null,
      picture: typeof profile.picture === 'string' ? profile.picture : null,
      preferredRole: preferredRoleCookie === 'seller' ? 'seller' : 'buyer',
    })

    // Minimal identity claims so cookie stays well under 4 KB
    store.complete(handle, {
      sub: String(synced.id),
      appUserId: String(synced.id),
      role: synced.role,
      name: synced.fullName,
      email: synced.email,
      picture: synced.avatarUrl || undefined,
    })

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  } catch (err) {
    console.error(
      'Preview OAuth complete failed:',
      err instanceof Error ? err.message : 'Unknown error',
    )
    store.fail(handle)
    return new Response(JSON.stringify({ error: 'Preview sign-in failed' }), {
      status: 400,
      headers,
    })
  }
}
