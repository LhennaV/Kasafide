'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Public pages have no theme button: they follow the device's light/dark setting, live.
 * Inside the portal (/module/...) the ThemeToggle still exists, and a choice saved there wins.
 *
 * THEME_INIT_SCRIPT (lib/theme-script.ts) does the same before first paint; this keeps it right
 * after client-side navigation between portal and public pages, and when the device switches.
 */
function savedPortalTheme(pathname: string): 'light' | 'dark' | null {
  if (!pathname.startsWith('/module/')) return null
  try {
    const t = localStorage.getItem('kf_theme')
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

export function SystemTheme() {
  const pathname = usePathname() || '/'

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const apply = () => {
      const theme = savedPortalTheme(pathname) ?? (media.matches ? 'light' : 'dark')
      document.documentElement.setAttribute('data-theme', theme)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [pathname])

  return null
}
