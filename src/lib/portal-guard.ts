import 'server-only'
import { redirect } from 'next/navigation'
import { appAuth, getRoleHomePath } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import type { Media, Notification, User } from '@/payload-types'

export type PortalUserSummary = {
  id: string
  fullName: string
  firstName: string
  middleInitial: string
  lastName: string
  email: string
  phone: string
  bio: string
  role: User['role']
  accountStatus: User['accountStatus']
  moaSignedAt: string | null
  moaSignatureName: string
  ewalletProvider: string
  ewalletNumber: string
  ewalletName: string
  bankName: string
  bankAccountNumber: string
  bankAccountName: string
  /** Null until the first-time guide is finished or skipped. */
  onboardingCompletedAt: string | null
  /** Uploaded profile photo, else the Google picture, else '' (initials are shown). */
  avatarUrl: string
  createdAt: string
}

export type PortalNotificationItem = {
  id: string
  title: string
  body: string
  type: 'listing' | 'message' | 'payment' | 'system'
  link: string
  unread: boolean
  createdAt: string
}

export async function requirePortalUser(allowedRoles?: Array<User['role']>) {
  const user = await appAuth.getCurrentUser()
  // Not signed in: go and sign in. Signed in with the wrong role: go to your own portal.
  if (!user) redirect('/auth/signin')
  if (allowedRoles && !allowedRoles.includes(user.role)) redirect(getRoleHomePath(user.role))

  // Ensure collection property is present for Payload access checks
  if (!('collection' in user) || !(user as unknown as { collection?: string }).collection) {
    ;(user as unknown as { collection: string }).collection = 'users'
  }

  // 3. Resiliently fetch notifications and message counts
  let notifications: PortalNotificationItem[] = []
  let unreadMessageCount = 0

  try {
    const payload = await getPayloadClient()
    const [notifsRes, unreadMsgsRes] = await Promise.all([
      payload
        .find({
          collection: 'notifications',
          user,
          overrideAccess: false,
          where: { recipient: { equals: user.id } },
          limit: 15,
          sort: '-createdAt',
        })
        .catch(() => ({ docs: [] })),
      payload
        .count({
          collection: 'messages',
          user,
          overrideAccess: false,
          where: {
            and: [{ recipient: { equals: user.id } }, { read: { equals: false } }],
          },
        })
        .catch(() => ({ totalDocs: 0 })),
    ])

    notifications = (notifsRes.docs as Notification[]).map((n: Notification) => ({
      id: String(n.id),
      title: n.title,
      body: n.body,
      type: n.type,
      link: n.link || '',
      unread: Boolean(n.unread),
      createdAt: n.createdAt,
    }))
    unreadMessageCount = unreadMsgsRes.totalDocs
  } catch (dataErr) {
    console.warn('[Kasafide Portal Guard] Notifications query fallback:', dataErr)
  }

  const summary: PortalUserSummary = {
    id: String(user.id),
    fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
    firstName: user.firstName,
    middleInitial: user.middleInitial || '',
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    bio: user.bio || '',
    role: user.role,
    accountStatus: user.accountStatus,
    moaSignedAt: user.moaSignedAt || null,
    moaSignatureName: user.moaSignatureName || '',
    ewalletProvider: user.ewalletProvider || '',
    ewalletNumber: user.ewalletNumber || '',
    ewalletName: user.ewalletName || '',
    bankName: user.bankName || '',
    bankAccountNumber: user.bankAccountNumber || '',
    bankAccountName: user.bankAccountName || '',
    onboardingCompletedAt: user.onboardingCompletedAt || null,
    avatarUrl:
      user.avatarUrl ||
      (user.avatar && typeof user.avatar === 'object' ? (user.avatar as Media).url || '' : ''),
    createdAt: user.createdAt,
  }

  return {
    rawUser: user,
    user: summary,
    notifications,
    unreadMessageCount,
  }
}
