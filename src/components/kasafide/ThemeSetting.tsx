'use client'

import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { THEME_EVENT, THEME_KEY } from '@/lib/theme-script'

type Pref = 'system' | 'light' | 'dark'

const OPTIONS: Array<{ value: Pref; label: string; Icon: typeof Sun }> = [
  { value: 'system', label: 'System default', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
]

/**
 * Appearance setting (Account Settings only; there is no theme button in any header).
 * "System default" follows the device's light/dark setting and is what everyone starts on.
 */
export function ThemeSetting() {
  const [pref, setPref] = useState<Pref>('system')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === 'light' || saved === 'dark') setPref(saved)
    } catch {}
  }, [])

  function choose(next: Pref) {
    setPref(next)
    try {
      if (next === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, next)
    } catch {}
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="text-lg font-black text-[var(--text)]">Appearance</h2>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">
        System default matches your phone or computer&apos;s light/dark setting.
      </p>
      <div role="radiogroup" aria-label="Theme" className="mt-4 grid grid-cols-3 gap-2 max-w-md">
        {OPTIONS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={pref === value}
            onClick={() => choose(value)}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-bold cursor-pointer ${
              pref === value
                ? 'border-[var(--primary)] bg-[var(--primary)]/12 text-[var(--primary)]'
                : 'border-[var(--border)] text-[var(--text-soft)] hover:border-[var(--primary)]'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
