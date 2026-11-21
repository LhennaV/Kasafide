import { randomBytes } from 'node:crypto'
import { getPayloadClient } from '@/lib/payload'
import type { User } from '@/payload-types'

export type GoogleProfileInput = {
  providerId: string
  email?: string | null
  name?: string | null
  givenName?: string | null
  familyName?: string | null
  picture?: string | null
  preferredRole?: 'buyer' | 'seller'
}

/**
 * Server-only OAuth identity sync.
 * Per payload-auth rules, this runs before an app user session exists, so it uses
 * overrideAccess: true ONLY here to map Google `sub` to a Payload `users` document.
 */
export async function syncGoogleUserToPayload(input: GoogleProfileInput): Promise<User> {
  const payload = await getPayloadClient()
  const cleanSub = String(input.providerId).trim()
  if (!cleanSub) {
    throw new Error('Missing Google providerId')
  }

  // 1. Find by stable Google `sub`
  const byProvider = await payload.find({
    collection: 'users',
    where: { providerId: { equals: cleanSub } },
    limit: 1,
    overrideAccess: true,
  })

  if (byProvider.docs[0]) {
    const existing = byProvider.docs[0]
    if (input.picture && existing.avatarUrl !== input.picture) {
      return await payload.update({
        collection: 'users',
        id: existing.id,
        data: { avatarUrl: input.picture },
        overrideAccess: true,
      })
    }
    return existing
  }

  // 2. Link existing email account if one already signed up with the same email
  const normalizedEmail = input.email ? String(input.email).trim().toLowerCase() : ''
  if (normalizedEmail) {
    const byEmail = await payload.find({
      collection: 'users',
      where: { email: { equals: normalizedEmail } },
      limit: 1,
      overrideAccess: true,
    })
    if (byEmail.docs[0]) {
      const existing = byEmail.docs[0]
      return await payload.update({
        collection: 'users',
        id: existing.id,
        data: {
          providerId: cleanSub,
          authProvider: 'google',
          ...(input.picture && !existing.avatarUrl ? { avatarUrl: input.picture } : {}),
        },
        overrideAccess: true,
      })
    }
  }

  // 3. Create new Payload app user record
  const nameParts = (input.name || '').trim().split(/\s+/).filter(Boolean)
  const firstName =
    (input.givenName || nameParts[0] || 'Kasafide').trim() || 'Kasafide'
  const lastName =
    (input.familyName || nameParts.slice(1).join(' ') || 'Member').trim() || 'Member'
  const emailToUse = normalizedEmail || `google-${cleanSub}@oauth.kasafide.local`
  const generatedPassword = `${randomBytes(24).toString('hex')}Aa1!`
  const role = input.preferredRole === 'seller' ? 'seller' : 'buyer'

  return await payload.create({
    collection: 'users',
    data: {
      email: emailToUse,
      password: generatedPassword,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      role,
      accountStatus: 'unverified',
      authProvider: 'google',
      providerId: cleanSub,
      avatarUrl: input.picture || undefined,
    },
    context: { trustedSeedOrOAuth: true },
    overrideAccess: true,
  })
}
