'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { DEMO_ROLES_LIST, type DemoRole } from '@/lib/demo-accounts'
import { announceSessionChange } from '@/lib/app-session-browser'

export function InstantDemoBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeRole, setActiveRole] = useState<DemoRole | null>(() => {
    if (pathname.includes('/module/super-admin')) return 'superadmin'
    if (pathname.includes('/module/admin')) return 'admin'
    if (pathname.includes('/module/seller')) return 'seller'
    if (pathname.includes('/module/buyer')) return 'buyer'
    return null
  })
  const [collapsed, setCollapsed] = useState(false)

  // Don't duplicate if already on admin CMS panel (/admin is Payload CMS)
  if (pathname.startsWith('/admin')) {
    return null
  }

  function handleSwitchRole(roleKey: DemoRole) {
    setActiveRole(roleKey)
    startTransition(async () => {
      try {
        const res = await fetch('/api/app-auth/demo', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ role: roleKey }),
        })
        const data = (await res.json()) as { ok?: boolean; redirectTo?: string }
        if (res.ok && data.ok) {
          await announceSessionChange(router)
          router.push(data.redirectTo || `/module/${roleKey}`)
        }
      } catch (err) {
        console.error('Error switching demo role:', err)
        // Fallback to direct navigation
        const targetPath =
          roleKey === 'superadmin'
            ? '/module/super-admin'
            : `/module/${roleKey}`
        router.push(targetPath)
      }
    })
  }

  return (
    <aside
      aria-label="Instant Demo Role Preview Toolbar"
      className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 transition-all duration-300 pointer-events-auto"
    >
      <div className="relative rounded-2xl border-2 border-[var(--primary)]/60 bg-[var(--surface)]/95 backdrop-blur-xl shadow-2xl p-2.5 sm:p-3 text-[var(--text)]">
        {/* Header / Collapse Bar */}
        <div className="flex items-center justify-between gap-2.5 pb-2 mb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--primary)]" />
            </span>
            <span className="font-black text-xs tracking-tight text-[var(--text)] truncate">
              ⚡ Instant Demo Role Preview
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[var(--primary)]/15 text-[var(--primary)]">
              No login needed
            </span>
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Expand demo bar' : 'Collapse demo bar'}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-soft)] text-xs font-bold cursor-pointer"
            >
              {collapsed ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Role Switcher Buttons */}
        {!collapsed && (
          <div className="space-y-2">
            <p className="text-[11px] text-[var(--text-muted)] leading-tight">
              Click any role to preview its dashboard &amp; test fixes with zero login:
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
              {DEMO_ROLES_LIST.map((demo) => {
                const isSelected = activeRole === demo.key
                return (
                  <button
                    key={demo.key}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSwitchRole(demo.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer select-none border ${
                      isSelected
                        ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-md scale-102'
                        : 'border-[var(--border)] bg-[var(--bg)]/80 text-[var(--text)] hover:border-[var(--primary)] hover:bg-[var(--surface-soft)]'
                    }`}
                    title={demo.description}
                  >
                    <span>{demo.icon}</span>
                    <span className="truncate">{demo.shortLabel}</span>
                  </button>
                )
              })}
            </div>
            {isPending && (
              <div className="text-[10px] font-bold text-[var(--primary)] animate-pulse text-center pt-0.5">
                Switching role session…
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
