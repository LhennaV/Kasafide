import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { appAuth, getRoleHomePath } from '@/lib/app-auth'
import { DEMO_ACCOUNTS, type DemoRole, getOrCreateDemoUser } from '@/lib/demo-accounts'
import { getPayloadClient } from '@/lib/payload'
import type { Notification, User } from '@/payload-types'

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
  gcashNumber: string
  mayaNumber: string
  isDemo?: boolean
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

function resolveDemoRoleForAllowed(allowedRoles?: Array<User['role']>, fallback: DemoRole = 'buyer'): DemoRole {
  if (!allowedRoles || allowedRoles.length === 0) return fallback
  const primary = allowedRoles[0]
  if (primary === 'seller') return 'seller'
  if (primary === 'admin') return 'admin'
  if (primary === 'superadmin' || primary === 'super_duper_admin') return 'superadmin'
  if (primary === 'buyer') return 'buyer'

  if (allowedRoles.includes('seller') && !allowedRoles.includes('buyer')) return 'seller'
  if (allowedRoles.includes('admin')) return 'admin'
  if (allowedRoles.includes('superadmin') || allowedRoles.includes('super_duper_admin')) return 'superadmin'
  return fallback
}

export async function requirePortalUser(allowedRoles?: Array<User['role']>) {
  let user = await appAuth.getCurrentUser()
  const cookieStore = await cookies()
  const demoRoleCookie = cookieStore.get('demo-role')?.value as DemoRole | undefined

  // 1. INSTANT DEMO PREVIEW: If not signed in, auto-provision and render the appropriate demo user!
  // No sign-in or sign-up needed!
  if (!user) {
    const targetRole =
      demoRoleCookie &&
      DEMO_ACCOUNTS[demoRoleCookie] &&
      (!allowedRoles || allowedRoles.includes(DEMO_ACCOUNTS[demoRoleCookie].role))
        ? demoRoleCookie
        : resolveDemoRoleForAllowed(allowedRoles, 'buyer')

    user = await getOrCreateDemoUser(targetRole)
  } else if (allowedRoles && !allowedRoles.includes(user.role)) {
    // 2. If an active demo user navigates to another portal role, seamlessly switch to that role's demo user
    const isDemo =
      user.email.endsWith('@kasafide.ph') ||
      String(user.id).startsWith('demo-') ||
      (typeof user.id === 'number' && user.id >= 90000) ||
      Boolean(demoRoleCookie)

    if (isDemo) {
      const targetRole = resolveDemoRoleForAllowed(allowedRoles, 'buyer')
      user = await getOrCreateDemoUser(targetRole)
    } else {
      redirect(getRoleHomePath(user.role))
    }
  }

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
    console.warn('[Kasafide Demo Guard] Notifications query fallback:', dataErr)
  }

  // If user has no notifications in DB yet, supply realistic demo notifications for the preview
  if (notifications.length === 0) {
    notifications = [
      {
        id: 'notif-demo-1',
        title: 'Welcome to Kasafide Demo Preview',
        body: `You are exploring the ${user.role} role. No sign in or sign up required.`,
        type: 'system',
        link: '',
        unread: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-demo-2',
        title: 'Sta. Maria Housing Network',
        body: 'All 24 barangays active with verified property listings.',
        type: 'listing',
        link: '/browse',
        unread: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ]
  }

  const isDemoUser =
    user.email.endsWith('@kasafide.ph') ||
    String(user.id).startsWith('demo-') ||
    Boolean(demoRoleCookie)

  const summary: PortalUserSummary = {
    id: String(user.id),
    fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
    firstName: user.firstName,
    middleInitial: user.middleInitial || '',
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '+63 917 123 4567',
    bio: user.bio || '',
    role: user.role,
    accountStatus: user.accountStatus,
    moaSignedAt: user.moaSignedAt || null,
    moaSignatureName: user.moaSignatureName || '',
    gcashNumber: user.gcashNumber || '',
    mayaNumber: user.mayaNumber || '',
    isDemo: isDemoUser,
  }

  return {
    rawUser: user,
    user: summary,
    notifications,
    unreadMessageCount,
  }
}
