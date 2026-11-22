import 'server-only'
import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import type { User } from '@/payload-types'
import {
  DEMO_ACCOUNTS,
  DEMO_ROLES_LIST,
  type DemoConfig,
  type DemoRole,
  getDemoConfigByRole,
} from './demo-constants'

export {
  DEMO_ACCOUNTS,
  DEMO_ROLES_LIST,
  type DemoConfig,
  type DemoRole,
  getDemoConfigByRole,
}

/** Synthesize a resilient fallback mock user object when database is inaccessible */
export function createFallbackDemoUser(roleKey: DemoRole): User {
  const config = DEMO_ACCOUNTS[roleKey] || DEMO_ACCOUNTS.buyer
  return {
    id: `demo-${config.key}`,
    firstName: config.label.split(' ')[0],
    middleInitial: 'K',
    lastName: 'Kasafide',
    fullName: `${config.label} (Demo)`,
    email: config.email,
    role: config.role,
    accountStatus: 'verified',
    authProvider: 'local',
    phone: '+63 917 123 4567',
    bio: `Active demo preview session for Kasafide ${config.label}.`,
    moaSignedAt: config.role === 'seller' ? '2026-01-15T08:00:00.000Z' : null,
    moaSignatureName: config.role === 'seller' ? 'Seller Kasafide Demo' : '',
    gcashNumber: '09171234567',
    mayaNumber: '09181234567',
    warningCount: 0,
    savedListings: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  } as unknown as User
}

/** Retrieve or create a durable demo user in Payload */
export async function getOrCreateDemoUser(roleKey: DemoRole): Promise<User> {
  const config = DEMO_ACCOUNTS[roleKey] || DEMO_ACCOUNTS.buyer
  try {
    const payload = await getPayloadClient()
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: config.email } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      const doc = existing.docs[0] as User
      // Make sure demo user has matching credentials and verified status
      try {
        await payload.update({
          collection: 'users',
          id: doc.id,
          overrideAccess: true,
          context: { trustedSeedOrOAuth: true },
          data: {
            password: config.password,
            accountStatus: 'verified',
            role: config.role,
          },
        })
      } catch {
        // Non-fatal if update fails
      }
      return doc
    }

    // Auto-create demo user document
    const created = await payload.create({
      collection: 'users',
      overrideAccess: true,
      context: { trustedSeedOrOAuth: true },
      data: {
        email: config.email,
        password: config.password,
        firstName: config.label.split(' ')[0],
        lastName: 'Kasafide',
        fullName: `${config.label} (Demo)`,
        role: config.role,
        accountStatus: 'verified',
        authProvider: 'local',
        phone: '+63 917 123 4567',
        bio: `Active demo preview session for Kasafide ${config.label}.`,
        moaSignedAt: config.role === 'seller' ? new Date().toISOString() : null,
        moaSignatureName: config.role === 'seller' ? 'Seller Kasafide Demo' : '',
        gcashNumber: '09171234567',
        mayaNumber: '09181234567',
      },
    })
    return created as User
  } catch (err) {
    console.warn(`[Kasafide Demo] Falling back to synthesized demo user for ${roleKey}:`, err)
    return createFallbackDemoUser(roleKey)
  }
}

/** Establish a full demo user session with cookie persistence */
export async function loginDemoSession(roleKey: DemoRole): Promise<{
  ok: boolean
  user: User
  redirectTo: string
}> {
  const config = DEMO_ACCOUNTS[roleKey] || DEMO_ACCOUNTS.buyer
  const user = await getOrCreateDemoUser(roleKey)
  const cookieStore = await cookies()
  const isProd = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV?.includes('preview')

  // Set demo-role indicator cookie for client & server detection
  cookieStore.set('demo-role', config.key, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  })

  // Try authenticating with Payload to obtain a real JWT session token
  try {
    const payload = await getPayloadClient()
    const result = await payload.login({
      collection: 'users',
      data: { email: config.email, password: config.password },
    })

    if (result.token) {
      cookieStore.set('app-session', result.token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      })
    }
  } catch (authErr) {
    console.warn('[Kasafide Demo] Payload login token generation bypassed:', authErr)
  }

  return {
    ok: true,
    user,
    redirectTo: config.homePath,
  }
}
