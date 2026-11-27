import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { randomBytes } from 'node:crypto'
import { getPayloadClient } from '@/lib/payload'
import { auth } from '@/auth'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { Config, User } from '@/payload-types'

const APP_SESSION_COOKIE = 'app-session'
const APP_SESSION_MAX_AGE = 30 * 24 * 60 * 60

type AppUserSlug = 'users'

export function createAppAuth(appUserCollection: AppUserSlug) {
  // A user read with payload.find()/create() has no `collection` key (only payload.auth() adds
  // it), and every access rule checks `user.collection === 'users'`. Without it, a Google or
  // Supabase sign-in was refused by Payload on create (posting a listing, sending a message) and
  // the page only said "Could not reach the server".
  function asAppUser(doc: unknown): User {
    return Object.assign(doc as object, { collection: appUserCollection }) as User
  }

  async function getLocalSessionUser(): Promise<User | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(APP_SESSION_COOKIE)?.value
    if (!token) return null

    const payload = await getPayloadClient()
    const authHeaders = new Headers({ Authorization: `JWT ${token}` })
    // payload.auth already reads the user row fresh from the database (Users has
    // auth.depth: 0, so relations stay as IDs). A second findByID here used to add one more
    // database round trip to every page load.
    const { user } = await payload.auth({ headers: authHeaders })
    if (!user || user.collection !== appUserCollection) return null
    return user as User
  }

  async function getOAuthSessionUser(): Promise<User | null> {
    if (!process.env.AUTH_SECRET) return null
    try {
      const session = await auth()
      if (!session?.user) return null
      const appUserId = (session.user as { id?: string }).id
      const payload = await getPayloadClient()
      if (appUserId) {
        const found = await payload.find({
          collection: appUserCollection,
          where: { id: { equals: appUserId } },
          limit: 1,
          depth: 1,
          overrideAccess: true,
        })
        if (found.docs[0]) return asAppUser(found.docs[0])
      }
      if (session.user.email) {
        const foundByEmail = await payload.find({
          collection: appUserCollection,
          where: { email: { equals: session.user.email.toLowerCase() } },
          limit: 1,
          depth: 1,
          overrideAccess: true,
        })
        if (foundByEmail.docs[0]) return asAppUser(foundByEmail.docs[0])
      }
      return null
    } catch {
      return null
    }
  }

  async function getSupabaseSessionUser(): Promise<User | null> {
    try {
      // No Supabase auth cookie → not a Supabase session; skip the client and the network call.
      const cookieStore = await cookies()
      if (!cookieStore.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'))) {
        return null
      }

      const supabase = await createSupabaseClient()
      // getClaims() verifies the session JWT locally when the project uses asymmetric signing
      // keys (and falls back to asking the Auth server otherwise). getUser() asked the Supabase
      // Auth server on every single page load, which was a large part of the wait.
      const { data: claimsData } = await supabase.auth.getClaims()
      const claims = claimsData?.claims
      const email = typeof claims?.email === 'string' ? claims.email.toLowerCase() : ''
      if (!email) return null
      const sbUser = {
        email,
        user_metadata: (claims?.user_metadata ?? {}) as Record<string, unknown>,
      }

      const payload = await getPayloadClient()
      const found = await payload.find({
        collection: appUserCollection,
        where: { email: { equals: email } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      if (found.docs[0]) return asAppUser(found.docs[0])

      // Auto-create local mirror user for the authenticated Supabase user
      const metadata = sbUser.user_metadata || {}
      const firstName = (metadata.first_name as string) || sbUser.email.split('@')[0]
      const lastName = (metadata.last_name as string) || ''
      const fullName = (metadata.full_name as string) || `${firstName} ${lastName}`.trim() || sbUser.email.split('@')[0]
      const role = (metadata.role as 'buyer' | 'seller') || 'buyer'

      const created = await payload.create({
        collection: appUserCollection,
        overrideAccess: true,
        context: { trustedSeedOrOAuth: true },
        data: {
          email: sbUser.email.toLowerCase(),
          password: randomBytes(24).toString('hex'),
          firstName,
          lastName,
          fullName,
          role,
          accountStatus: 'verified',
          authProvider: 'google',
        },
      })

      return asAppUser(created)
    } catch {
      return null
    }
  }

  // cache(): within one request (page + its server components + metadata) the user is looked
  // up once, not once per caller.
  const getCurrentUser = cache(async (): Promise<User | null> => {
    const localUser = await getLocalSessionUser()
    if (localUser) return localUser
    const sbUser = await getSupabaseSessionUser()
    if (sbUser) return sbUser
    return await getOAuthSessionUser()
  })

  async function loginWithEmailPassword(email: string, password: string): Promise<User> {
    const payload = await getPayloadClient()
    const result = await payload.login({
      collection: appUserCollection,
      data: { email: email.trim().toLowerCase(), password },
    })
    if (!result.token || !result.user) {
      throw new Error('Invalid email or password')
    }
    const cookieStore = await cookies()
    const isProd = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV?.includes('preview')
    cookieStore.set(APP_SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: APP_SESSION_MAX_AGE,
    })
    return result.user as User
  }

  async function clearLocalSession(): Promise<void> {
    const cookieStore = await cookies()
    const isProd = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV?.includes('preview')
    cookieStore.set(APP_SESSION_COOKIE, '', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    cookieStore.set('demo-role', '', {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    // Sign out from Supabase Auth so SSR session does not re-authenticate user
    try {
      const supabase = await createSupabaseClient()
      await supabase.auth.signOut()
    } catch (sbErr) {
      console.warn('Supabase sign out during clearLocalSession:', sbErr)
    }

    // Safeguard: explicitly clear any lingering Supabase auth cookies
    try {
      const allCookies = cookieStore.getAll()
      for (const cookie of allCookies) {
        if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
          cookieStore.set(cookie.name, '', {
            path: '/',
            maxAge: 0,
          })
        }
      }
    } catch {}
  }

  return {
    getCurrentUser,
    getLocalSessionUser,
    getOAuthSessionUser,
    loginWithEmailPassword,
    clearLocalSession,
    collection: appUserCollection as keyof Config['collections'],
  }
}

export const appAuth = createAppAuth('users')

export function getRoleHomePath(role?: string | null): string {
  switch (role) {
    case 'seller':
      return '/module/seller'
    case 'admin':
      return '/module/admin'
    case 'superadmin':
    case 'super_duper_admin':
      return '/module/super-admin'
    case 'buyer':
    default:
      return '/module/buyer'
  }
}
