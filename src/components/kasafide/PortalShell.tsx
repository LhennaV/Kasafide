'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { markAllNotificationsReadAction } from '@/app/actions/kasafide'
import { announceSessionChange, signOutInPlace } from '@/lib/app-session-browser'
import type { PortalNotificationItem, PortalUserSummary } from '@/lib/portal-guard'
import { KasafideLogo } from './KasafideLogo'
import { ThemeToggle } from './ThemeToggle'

type NavItem = {
  id: string
  label: string
  shortLabel: string
  href: string
  icon: 'grid' | 'heart' | 'message' | 'wallet' | 'home' | 'users' | 'shield' | 'flag' | 'chart' | 'plus' | 'doc' | 'calendar'
}

function NavIcon({ name, className = 'w-4 h-4' }: { name: NavItem['icon']; className?: string }) {
  switch (name) {
    case 'heart':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case 'message':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 'wallet':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      )
    case 'home':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case 'users':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
      )
    case 'shield':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case 'flag':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      )
    case 'chart':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    case 'plus':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      )
    case 'doc':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    case 'grid':
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
  }
}

function getRoleNavigation(role: PortalUserSummary['role']): {
  primary: NavItem[]
  secondary: Array<{ label: string; href: string }>
  folder: string
} {
  if (role === 'seller') {
    return {
      folder: 'seller',
      primary: [
        { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', href: '/module/seller', icon: 'grid' },
        { id: 'listings', label: 'My Listings', shortLabel: 'Listings', href: '/module/seller/listings', icon: 'home' },
        { id: 'post', label: 'Post Property', shortLabel: 'Post', href: '/module/seller/post', icon: 'plus' },
        { id: 'messages', label: 'Messages', shortLabel: 'Chat', href: '/module/seller/messages', icon: 'message' },
        { id: 'payments', label: 'Payments', shortLabel: 'Pay', href: '/module/seller/payments', icon: 'wallet' },
      ],
      secondary: [
        { label: 'Viewing Requests', href: '/module/seller/viewing-requests' },
        { label: 'My Tenants & Deposits', href: '/module/seller/tenants' },
        { label: 'Memorandum of Agreement (MOA)', href: '/module/seller/moa' },
        { label: 'Identity Verification', href: '/module/seller/verification' },
        { label: 'My Reviews', href: '/module/seller/reviews' },
        { label: 'Notifications', href: '/module/seller/notifications' },
        { label: 'Profile & Settings', href: '/module/seller/settings' },
        { label: 'Help & Support', href: '/module/seller/help' },
      ],
    }
  }

  if (role === 'admin') {
    return {
      folder: 'admin',
      primary: [
        { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', href: '/module/admin', icon: 'grid' },
        { id: 'listings', label: 'Listings Management', shortLabel: 'Listings', href: '/module/admin/listings', icon: 'home' },
        { id: 'users', label: 'Users', shortLabel: 'Users', href: '/module/admin/users', icon: 'users' },
        { id: 'payments', label: 'Payments', shortLabel: 'Pay', href: '/module/admin/payments', icon: 'wallet' },
        { id: 'reports', label: 'Reports', shortLabel: 'Reports', href: '/module/admin/reports', icon: 'flag' },
        { id: 'analytics', label: 'Analytics', shortLabel: 'Stats', href: '/module/admin/analytics', icon: 'chart' },
      ],
      secondary: [
        { label: 'Notifications', href: '/module/admin/notifications' },
        { label: 'My Profile & Settings', href: '/module/admin/settings' },
      ],
    }
  }

  if (role === 'superadmin' || role === 'super_duper_admin') {
    return {
      folder: 'super-admin',
      primary: [
        { id: 'dashboard', label: 'Super Admin Panel', shortLabel: 'Control', href: '/module/super-admin', icon: 'shield' },
        { id: 'admins', label: 'Admin Management', shortLabel: 'Admins', href: '/module/super-admin/admins', icon: 'users' },
        { id: 'audit-trail', label: 'Audit Trail', shortLabel: 'Audit', href: '/module/super-admin/audit-trail', icon: 'flag' },
        { id: 'reports', label: 'System Reports', shortLabel: 'Reports', href: '/module/super-admin/reports', icon: 'chart' },
      ],
      secondary: [
        { label: 'Admin Hub · Dashboard', href: '/module/admin' },
        { label: 'Admin Hub · Listings', href: '/module/admin/listings' },
        { label: 'Admin Hub · Users', href: '/module/admin/users' },
        { label: 'Admin Hub · Payments', href: '/module/admin/payments' },
        { label: 'Notifications', href: '/module/super-admin/notifications' },
        { label: 'Profile & Settings', href: '/module/super-admin/settings' },
      ],
    }
  }

  return {
    folder: 'buyer',
    primary: [
      { id: 'dashboard', label: 'Dashboard', shortLabel: 'Explore', href: '/module/buyer', icon: 'grid' },
      { id: 'saved', label: 'Saved Listings', shortLabel: 'Saved', href: '/module/buyer/saved', icon: 'heart' },
      { id: 'messages', label: 'Messages', shortLabel: 'Chat', href: '/module/buyer/messages', icon: 'message' },
      { id: 'payments', label: 'Payments', shortLabel: 'Payments', href: '/module/buyer/payments', icon: 'wallet' },
    ],
    secondary: [
      { label: 'Identity Verification', href: '/module/buyer/verification' },
      { label: 'Reviews & Feedback', href: '/module/buyer/reviews' },
      { label: 'Notifications', href: '/module/buyer/notifications' },
      { label: 'My Profile', href: '/module/buyer/profile' },
      { label: 'Account Settings', href: '/module/buyer/settings' },
      { label: 'Help & Meowrie Assistant', href: '/module/buyer/help' },
    ],
  }
}

export function PortalShell({
  user,
  activePage,
  notifications,
  unreadMessageCount = 0,
  children,
}: {
  user: PortalUserSummary
  activePage: string
  notifications: PortalNotificationItem[]
  unreadMessageCount?: number
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [moreSheetOpen, setMoreSheetOpen] = useState(false)

  const nav = getRoleNavigation(user.role)
  const unreadNotifCount = notifications.filter((n) => n.unread).length
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'K'

  async function switchDemoRole(demoRole: 'buyer' | 'seller' | 'admin' | 'superadmin') {
    const res = await fetch('/api/app-auth/demo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ role: demoRole }),
    })
    const data = (await res.json()) as { ok?: boolean; redirectTo?: string }
    if (res.ok && data.ok) {
      await announceSessionChange(router)
      window.location.href = data.redirectTo || `/module/${demoRole === 'superadmin' ? 'super-admin' : demoRole}`
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)]">
      {/* ── Desktop Collapsible Hover Rail Sidebar (Preserved from sidebar.js) ── */}
      <aside className="hidden md:block kf-rail-slot relative z-40 shrink-0">
        <div className="kf-rail-panel fixed top-0 left-0 bottom-0 bg-[var(--sidebar-bg)] border-r border-black/20 flex flex-col py-5 px-3 overflow-x-hidden overflow-y-auto">
          <Link href="/" className="flex items-center gap-2.5 px-2 mb-7 shrink-0">
            <KasafideLogo size={28} variant="dark" />
            <span className="kf-rail-label font-extrabold text-[17px] text-[#FBF6F0] whitespace-nowrap overflow-hidden transition-all">
              Kasafide
            </span>
          </Link>

          <nav aria-label="Role navigation" className="flex-1 space-y-1">
            {nav.primary.map((item) => {
              const active = item.id === activePage
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition relative ${
                    active
                      ? 'bg-[#FF8A65]/18 text-[#FBF6F0] border-l-3 border-[#FF8A65]'
                      : 'text-white/65 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <span className={active ? 'text-[#FF8A65]' : ''}>
                    <NavIcon name={item.icon} />
                  </span>
                  <span className="kf-rail-label whitespace-nowrap overflow-hidden transition-all">
                    {item.label}
                  </span>
                  {item.id === 'messages' && unreadMessageCount > 0 && (
                    <span className="kf-rail-label ml-auto px-1.5 py-0.5 rounded-full bg-[#FF8A65] text-[#2B1B3D] text-[10px] font-black">
                      {unreadMessageCount}
                    </span>
                  )}
                </Link>
              )
            })}

            {nav.secondary.length > 0 && (
              <div className="kf-rail-submenu pt-4 mt-3 border-t border-white/10 space-y-1">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white/45">
                  More Tools
                </div>
                {nav.secondary.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="block px-3 py-2 rounded-xl text-xs font-medium text-white/65 hover:text-white hover:bg-white/8 truncate"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          <div className="pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={async () => {
                await signOutInPlace(router)
                router.push('/')
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-white/65 hover:text-[#FF8A8A] hover:bg-[#FF8A8A]/12 transition cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="kf-rail-label whitespace-nowrap overflow-hidden transition-all">
                Log out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Column ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar (Preserved from topbar.js) */}
        <header className="sticky top-0 z-30 h-15 px-4 sm:px-7 bg-[var(--surface)]/92 backdrop-blur-md border-b border-[var(--border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/" className="md:hidden flex items-center gap-2 font-extrabold text-base shrink-0">
              <KasafideLogo size={26} />
              <span>Kasafide</span>
            </Link>
            <span className="px-2.5 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-[11px] font-extrabold uppercase tracking-wider truncate">
              {user.role === 'super_duper_admin'
                ? 'Super Admin'
                : user.role === 'superadmin'
                  ? 'Super Admin'
                  : user.role}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop Quick Role Switcher Pill */}
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[11px]">
              <span className="text-[var(--primary)] font-black flex items-center gap-1 px-1">
                <span>⚡ Demo:</span>
              </span>
              {(['buyer', 'seller', 'admin', 'superadmin'] as const).map((r) => {
                const isCurrent =
                  (r === 'superadmin' && (user.role === 'super_duper_admin' || user.role === 'superadmin')) ||
                  user.role === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => switchDemoRole(r)}
                    className={`px-2.5 py-0.5 rounded-full font-extrabold capitalize cursor-pointer transition ${
                      isCurrent
                        ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-xs'
                        : 'text-[var(--text-soft)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    {r === 'superadmin' ? 'Super Admin' : r}
                  </button>
                )
              })}
            </div>

            <ThemeToggle className="w-9 h-9" />

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setNotifOpen((v) => !v)
                  setProfileOpen(false)
                }}
                className="relative w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] flex items-center justify-center text-[var(--text)] cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-extrabold text-sm">Notifications</span>
                    {unreadNotifCount > 0 && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await markAllNotificationsReadAction()
                            router.refresh()
                          })
                        }}
                        className="text-xs font-bold text-[var(--primary)] cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.link || `/module/${nav.folder}/notifications`}
                          onClick={() => setNotifOpen(false)}
                          className={`block p-2.5 rounded-xl text-xs transition ${
                            n.unread ? 'bg-[var(--primary)]/12' : 'hover:bg-[var(--surface-soft)]'
                          }`}
                        >
                          <div className="font-bold text-[var(--text)]">{n.title}</div>
                          <div className="text-[var(--text-muted)] line-clamp-2 mt-0.5">{n.body}</div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                        No notifications yet
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/module/${nav.folder}/notifications`}
                    onClick={() => setNotifOpen(false)}
                    className="mt-3 block w-full py-2 rounded-xl bg-[var(--primary)]/12 text-[var(--primary)] text-center text-xs font-extrabold"
                  >
                    See All Notifications &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Avatar Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((v) => !v)
                  setNotifOpen(false)
                }}
                className="w-9 h-9 rounded-full bg-[var(--primary)]/20 border-2 border-[var(--primary)]/50 text-[var(--primary)] text-xs font-extrabold flex items-center justify-center cursor-pointer"
              >
                {initials}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <div className="font-extrabold text-sm text-[var(--text)] truncate">
                      {user.fullName}
                    </div>
                    <div className="text-[11px] font-bold text-[var(--primary)] capitalize">
                      {user.role === 'super_duper_admin' ? 'Super Admin' : user.role} &middot;{' '}
                      {user.accountStatus}
                    </div>
                  </div>
                  <div className="py-1.5 text-xs font-semibold">
                    <Link
                      href={`/module/${nav.folder}/profile`}
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 hover:bg-[var(--surface-soft)]"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/module/${nav.folder}/settings`}
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 hover:bg-[var(--surface-soft)]"
                    >
                      Account Settings
                    </Link>
                    {(user.role === 'buyer' || user.role === 'seller') && (
                      <>
                        <Link
                          href={`/module/${nav.folder}/verification`}
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-[var(--primary)] hover:bg-[var(--surface-soft)]"
                        >
                          Identity Verification
                        </Link>
                        <Link
                          href={`/module/${nav.folder}/help`}
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 hover:bg-[var(--surface-soft)]"
                        >
                          Help &amp; Support
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        setProfileOpen(false)
                        await signOutInPlace(router)
                        router.push('/')
                      }}
                      className="w-full text-left px-4 py-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-7 pb-safe md:pb-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile Fixed Bottom Navigation Bar (Preserved & Enhanced from sidebar.js) ── */}
      <nav
        aria-label="Mobile role navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--sidebar-bg)] border-t border-black/25 safe-bottom"
      >
        <div className="flex items-stretch h-[62px]">
          {nav.primary.slice(0, 4).map((item) => {
            const active = item.id === activePage
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 relative ${
                  active ? 'text-[#FF8A65]' : 'text-white/65'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-b bg-white" />
                )}
                <span className="relative">
                  <NavIcon name={item.icon} className="w-5 h-5" />
                  {item.id === 'messages' && unreadMessageCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#FF8A8A] text-[#2B1B3D] text-[9px] font-black flex items-center justify-center">
                      {unreadMessageCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-bold">{item.shortLabel}</span>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setMoreSheetOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-white/75 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
            </svg>
            <span className="text-[10px] font-bold">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Drawer Sheet (All Subpages + Role Switcher + Sign Out) */}
      {moreSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs">
          <div className="w-full rounded-t-3xl bg-[var(--surface)] border-t border-[var(--border)] p-5 space-y-4 safe-bottom max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-extrabold text-base text-[var(--text)]">{user.fullName}</div>
                <div className="text-xs font-bold text-[var(--primary)] capitalize">
                  {user.role === 'super_duper_admin' ? 'Super Admin' : user.role} Portal Menu
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMoreSheetOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface-soft)] text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {nav.primary.slice(4).map((extra) => (
                <Link
                  key={extra.id}
                  href={extra.href}
                  onClick={() => setMoreSheetOpen(false)}
                  className="px-4 py-3 rounded-xl bg-[var(--surface-soft)] text-sm font-bold text-[var(--text)]"
                >
                  {extra.label}
                </Link>
              ))}
              {nav.secondary.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={() => setMoreSheetOpen(false)}
                  className="px-4 py-3 rounded-xl bg-[var(--surface-soft)] text-sm font-semibold text-[var(--text)]"
                >
                  {sub.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-[var(--border)]">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Quick Demo Role Switcher
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['buyer', 'seller', 'admin', 'superadmin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={async () => {
                      setMoreSheetOpen(false)
                      await switchDemoRole(r)
                    }}
                    className="py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs font-bold capitalize"
                  >
                    {r === 'superadmin' ? 'Super Admin' : r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setMoreSheetOpen(false)
                await signOutInPlace(router)
                router.push('/')
              }}
              className="w-full py-3 rounded-xl bg-[var(--danger)]/15 text-[var(--danger)] font-extrabold text-sm"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
