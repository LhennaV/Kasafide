import { randomBytes } from 'node:crypto'
import type { JWT } from 'next-auth/jwt'

const SECRET = /^[a-f0-9]{64}$/
const TRANSACTION_TTL_MS = 5 * 60_000
// Figma's callback host forwards at most this much.
const MAX_CALLBACK_LENGTH = 8192

export const newPreviewOAuthSecret = () => randomBytes(32).toString('hex')

/** The origin is the configured browser-facing sandbox origin, never a request header. */
export function isPreviewOAuthPost(request: Request, trustedOrigin: string): boolean {
  return (
    request.method === 'POST' &&
    request.headers.get('origin') === trustedOrigin &&
    request.headers.get('content-type')?.split(';')[0].trim() === 'application/json'
  )
}

/** Validate bootstrap CSRF on start in addition to the same-origin POST check. */
export function hasPreviewOAuthCsrf(cookie: string | undefined, submitted: unknown): boolean {
  return typeof cookie === 'string' && SECRET.test(cookie) && cookie === submitted
}

/** Reads the fragment the callback page POSTs; its parameters are the provider's query. */
export function readPreviewOAuthCallback(body: unknown): URLSearchParams | null {
  const callback = (body as { callback?: unknown } | null)?.callback
  if (typeof callback !== 'string' || !callback || callback.length > MAX_CALLBACK_LENGTH) {
    return null
  }
  return new URLSearchParams(callback)
}

type Transaction<T> = {
  expires: number
  nonce: string
  verifier: string
  phase: 'pending' | 'exchanging' | 'complete'
  result?: T
}

/**
 * Share one instance across routes and HMR; multiple processes need shared atomic storage.
 * After a restart, require a new sign-in instead of rebuilding transactions from input.
 */
export function createPreviewOAuthStore<T>(now = Date.now, capacity = 1000) {
  const transactions = new Map<string, Transaction<T>>()
  const live = (secret: string) => {
    const entry = transactions.get(secret)
    if (entry && entry.expires <= now()) {
      transactions.delete(secret)
      return undefined
    }
    return entry
  }
  return {
    begin(secret: string) {
      for (const key of transactions.keys()) live(key)
      if (!SECRET.test(secret) || transactions.has(secret) || transactions.size >= capacity) {
        return null
      }
      const nonce = newPreviewOAuthSecret()
      const verifier = newPreviewOAuthSecret()
      transactions.set(secret, {
        nonce,
        verifier,
        expires: now() + TRANSACTION_TTL_MS,
        phase: 'pending',
      })
      return { nonce, verifier }
    },
    takeCallback(secret: string, stateNonce: string, popupNonceCookie: string | undefined) {
      const entry = live(secret)
      if (
        !entry ||
        entry.phase !== 'pending' ||
        entry.nonce !== stateNonce ||
        entry.nonce !== popupNonceCookie
      )
        return null
      // Claim before any asynchronous token exchange: concurrent callbacks cannot replay it.
      entry.phase = 'exchanging'
      return entry.verifier
    },
    complete(secret: string, result: T) {
      const entry = live(secret)
      if (!entry || entry.phase !== 'exchanging') return false
      entry.result = result
      entry.phase = 'complete'
      return true
    },
    fail(secret: string) {
      if (live(secret)?.phase === 'exchanging') transactions.delete(secret)
    },
    consume(secret: string): { status: 'pending' | 'missing' } | { status: 'complete'; result: T } {
      const entry = live(secret)
      if (!entry) return { status: 'missing' }
      if (entry.phase !== 'complete') return { status: 'pending' }
      transactions.delete(secret)
      return { status: 'complete', result: entry.result as T }
    },
  }
}

type GlobalWithStore = typeof globalThis & {
  __kasafidePreviewOAuthStore?: ReturnType<typeof createPreviewOAuthStore<JWT>>
}

export function getPreviewOAuthStore() {
  const g = globalThis as GlobalWithStore
  if (!g.__kasafidePreviewOAuthStore) {
    g.__kasafidePreviewOAuthStore = createPreviewOAuthStore<JWT>()
  }
  return g.__kasafidePreviewOAuthStore
}

export function getTrustedSandboxOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL
  if (!raw) return null
  try {
    return new URL(raw).origin
  } catch {
    return null
  }
}
