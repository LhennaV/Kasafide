'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { THEME_EVENT, THEME_KEY } from '@/lib/theme-script'

/**
 * Every page follows the device's light/dark setting, live, unless a Light/Dark choice was saved
 * in Account Settings → Appearance (there is no theme button in any header).
 *
 * THEME_INIT_SCRIPT (lib/theme-script.ts) does the same before first paint; this keeps it right
 * after client-side navigation, when the device switches, and when the setting changes.
 */
function savedTheme(): 'light' | 'dark' | null {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

export function SystemTheme() {
  const pathname = usePathname() || '/'

  useEffect(() => {
    // Suppress DevTools/inspector recursion warnings during HMR/fast refresh
    const ignorePatterns = [
      'The children should not have changed if we pass in the same set',
      'updateFiberRecursively',
      'updateVirtualChildrenRecursively',
    ]

    const origError = console.error
    console.error = function (...args: unknown[]) {
      const str = args
        .map((a) => (a instanceof Error ? a.message + ' ' + (a.stack || '') : String(a)))
        .join(' ')
      if (ignorePatterns.some((pattern) => str.includes(pattern))) {
        return
      }
      origError.apply(console, args)
    }

    const errorHandler = (e: ErrorEvent) => {
      const msg = e.message || (e.error && e.error.message) || ''
      if (ignorePatterns.some((pattern) => msg.includes(pattern))) {
        e.stopImmediatePropagation()
        e.preventDefault()
      }
    }

    window.addEventListener('error', errorHandler, true)

    const media = window.matchMedia('(prefers-color-scheme: light)')
    const apply = () => {
      const theme = savedTheme() ?? (media.matches ? 'light' : 'dark')
      document.documentElement.setAttribute('data-theme', theme)
    }
    apply()
    media.addEventListener('change', apply)
    window.addEventListener(THEME_EVENT, apply)
    return () => {
      media.removeEventListener('change', apply)
      window.removeEventListener(THEME_EVENT, apply)
      window.removeEventListener('error', errorHandler, true)
    }
  }, [pathname])

  return null
}
