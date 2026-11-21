import { encode } from 'next-auth/jwt'
import {
  getPreviewOAuthStore,
  getTrustedSandboxOrigin,
  isPreviewOAuthPost,
} from '@/lib/preview-oauth-server'
import { SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session-cookie'

export async function POST(request: Request) {
  const baseHeaders = new Headers({
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
  })

  const trustedOrigin = getTrustedSandboxOrigin()
  if (!trustedOrigin || !isPreviewOAuthPost(request, trustedOrigin)) {
    return new Response(null, { status: 403, headers: baseHeaders })
  }

  const body = (await request.json().catch(() => null)) as { secret?: unknown } | null
  if (!body || typeof body.secret !== 'string') {
    return new Response(null, { status: 400, headers: baseHeaders })
  }

  const store = getPreviewOAuthStore()
  const outcome = store.consume(body.secret)

  if (outcome.status === 'pending') {
    return new Response(null, { status: 202, headers: baseHeaders })
  }
  if (outcome.status !== 'complete' || !process.env.AUTH_SECRET) {
    return new Response(null, { status: 410, headers: baseHeaders })
  }

  const token = await encode({
    token: outcome.result,
    secret: process.env.AUTH_SECRET,
    salt: SESSION_COOKIE,
    maxAge: SESSION_MAX_AGE,
  })

  const cookie = [
    `${SESSION_COOKIE}=${token}`,
    `Max-Age=${SESSION_MAX_AGE}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=None',
    'Partitioned',
  ].join('; ')

  baseHeaders.set('set-cookie', cookie)
  return new Response(null, { status: 204, headers: baseHeaders })
}
