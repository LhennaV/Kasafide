export type DemoRole = 'buyer' | 'seller' | 'admin' | 'superadmin'

export type DemoConfig = {
  key: DemoRole
  email: string
  password: string
  role: 'buyer' | 'seller' | 'admin' | 'super_duper_admin'
  label: string
  shortLabel: string
  badge: string
  description: string
  homePath: string
  icon: string
}

export const DEMO_ACCOUNTS: Record<DemoRole, DemoConfig> = {
  buyer: {
    key: 'buyer',
    email: 'buyer@kasafide.ph',
    password: 'KasafideDemo2026!',
    role: 'buyer',
    label: 'Buyer / Renter',
    shortLabel: 'Buyer',
    badge: 'Verified Buyer',
    description: 'Explore verified listings, save favorites, message owners, and submit viewing requests.',
    homePath: '/module/buyer',
    icon: '👤',
  },
  seller: {
    key: 'seller',
    email: 'seller@kasafide.ph',
    password: 'KasafideDemo2026!',
    role: 'seller',
    label: 'Verified Seller',
    shortLabel: 'Seller',
    badge: 'Verified Owner',
    description: 'Post and manage listings, track tenants & payments, sign MOA, and view inquiries.',
    homePath: '/module/seller',
    icon: '🏡',
  },
  admin: {
    key: 'admin',
    email: 'admin@kasafide.ph',
    password: 'KasafideDemo2026!',
    role: 'admin',
    label: 'Admin Moderator',
    shortLabel: 'Admin',
    badge: 'Staff Moderator',
    description: 'Moderate listing titles, review seller ID submissions, handle reports, and audit payments.',
    homePath: '/module/admin',
    icon: '🛡️',
  },
  superadmin: {
    key: 'superadmin',
    email: 'superadmin@kasafide.ph',
    password: 'KasafideDemo2026!',
    role: 'super_duper_admin',
    label: 'Super Admin',
    shortLabel: 'Super Admin',
    badge: 'System Owner',
    description: 'Full system oversight, manage staff admins, inspect audit logs, and monitor analytics.',
    homePath: '/module/super-admin',
    icon: '⚡',
  },
}

export const DEMO_ROLES_LIST: DemoConfig[] = [
  DEMO_ACCOUNTS.buyer,
  DEMO_ACCOUNTS.seller,
  DEMO_ACCOUNTS.admin,
  DEMO_ACCOUNTS.superadmin,
]

export function getDemoConfigByRole(roleSlug?: string | null): DemoConfig {
  if (roleSlug === 'seller') return DEMO_ACCOUNTS.seller
  if (roleSlug === 'admin') return DEMO_ACCOUNTS.admin
  if (roleSlug === 'superadmin' || roleSlug === 'super_duper_admin') return DEMO_ACCOUNTS.superadmin
  return DEMO_ACCOUNTS.buyer
}
