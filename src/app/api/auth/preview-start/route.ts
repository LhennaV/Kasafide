import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import {
  getPreviewOAuthStore,
  getTrustedSandboxOrigin,
  hasPreviewOAuthCsrf,
  isPreviewOAuthPost,
} from '@/lib/preview-oauth-server'

function hasEnoughEnvelopeLifetime(prefix: string): boolean {
  const parts = prefix.split('.')
  if (parts.length !== 3) return false
  try {
    const decoded = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
      exp?: number
    }
    if (typeof decoded.exp === 'number') {
      return decoded.exp * 1000 - Date.now() > 60_000
    }
    return true
  } catch {
    return true
  }
}

export async function POST(request: Request) {
  const baseHeaders = new Headers({
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
    'content-type': 'application/json',
  })

  const trustedOrigin = getTrustedSandboxOrigin()
  if (!trustedOrigin || !isPreviewOAuthPost(request, trustedOrigin)) {
    return new Response(JSON.stringify({ error: 'Invalid preview request origin' }), {
      status: 403,
      headers: baseHeaders,
    })
  }

  const body = (await request.json().catch(() => null)) as {
    secret?: unknown
    csrf?: unknown
  } | null
  const cookieStore = await cookies()
  const bootstrapCookie = cookieStore.get('__Host-pv_bootstrap')?.value

  baseHeaders.append(
    'set-cookie',
    '__Host-pv_bootstrap=; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=0',
  )

  if (!body || typeof body.secret !== 'string' || !hasPreviewOAuthCsrf(bootstrapCookie, body.csrf)) {
    return new Response(JSON.stringify({ error: 'Invalid preview bootstrap token' }), {
      status: 403,
      headers: baseHeaders,
    })
  }

  const redirectUri = process.env.FIGMA_PREVIEW_OAUTH_REDIRECT_URI
  const statePrefix = process.env.FIGMA_PREVIEW_OAUTH_STATE_PREFIX
  const clientId = process.env.AUTH_GOOGLE_ID
  const clientSecret = process.env.AUTH_GOOGLE_SECRET
  const authSecret = process.env.AUTH_SECRET

  if (
    !redirectUri ||
    !statePrefix ||
    !hasEnoughEnvelopeLifetime(statePrefix) ||
    !clientId ||
    !clientSecret ||
    !authSecret
  ) {
    return new Response(
      JSON.stringify({
        error:
          'Google OAuth environment variables are not configured yet. Complete the Google OAuth card or sign in with email and password.',
      }),
      { status: 503, headers: baseHeaders },
    )
  }

  const store = getPreviewOAuthStore()
  const started = store.begin(body.secret)
  if (!started) {
    return new Response(JSON.stringify({ error: 'Could not start preview OAuth transaction' }), {
      status: 400,
      headers: baseHeaders,
    })
  }

  baseHeaders.append(
    'set-cookie',
    `__Host-pv_handle=${body.secret}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=300`,
  )
  baseHeaders.append(
    'set-cookie',
    `__Host-pv_nonce=${started.nonce}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=300`,
  )

  const state = [
    statePrefix,
    started.nonce,
    Buffer.from('/api/auth/preview-callback').toString('base64url'),
  ].join('.')

  const challenge = createHash('sha256').update(started.verifier).digest('base64url')

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge', challenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('prompt', 'select_account')

  return new Response(JSON.stringify({ authorizationUrl: authUrl.toString() }), {
    status: 200,
    headers: baseHeaders,
  })
}
