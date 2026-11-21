import 'server-only'
import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { auth } from '@/auth'
import type { Config, User } from '@/payload-types'

const APP_SESSION_COOKIE = 'app-session'
const APP_SESSION_MAX_AGE = 30 * 24 * 60 * 60

type AppUserSlug = 'users'

export function createAppAuth(appUserCollection: AppUserSlug) {
  async function getLocalSessionUser(): Promise<User | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(APP_SESSION_COOKIE)?.value
    if (!token) return null

    const payload = await getPayloadClient()
    const authHeaders = new Headers({ Authorization: `JWT ${token}` })
    const { user } = await payload.auth({ headers: authHeaders })
    if (!user || user.collection !== appUserCollection) return null

    // Fetch fresh user document with isolated user permissions
    try {
      const doc = await payload.findByID({
        collection: appUserCollection,
        id: user.id,
        overrideAccess: false,
        user: user as User,
        depth: 1,
      })
      return doc as User
    } catch {
      return user as User
    }
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
        if (found.docs[0]) return found.docs[0] as User
      }
      if (session.user.email) {
        const foundByEmail = await payload.find({
          collection: appUserCollection,
          where: { email: { equals: session.user.email.toLowerCase() } },
          limit: 1,
          depth: 1,
          overrideAccess: true,
        })
        if (foundByEmail.docs[0]) return foundByEmail.docs[0] as User
      }
      return null
    } catch {
      return null
    }
  }

  async function getCurrentUser(): Promise<User | null> {
    const localUser = await getLocalSessionUser()
    if (localUser) return localUser
    return await getOAuthSessionUser()
  }

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
    cookieStore.set(APP_SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      partitioned: true,
      path: '/',
      maxAge: APP_SESSION_MAX_AGE,
    })
    return result.user as User
  }

  async function clearLocalSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.set(APP_SESSION_COOKIE, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      partitioned: true,
      path: '/',
      maxAge: 0,
    })
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
