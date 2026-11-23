'use client'

import { useEffect, useState } from 'react'
import { dismissToast, subscribeToasts, type ToastItem } from '@/lib/toast'

const STYLES: Record<ToastItem['kind'], { box: string; icon: string }> = {
  success: {
    box: 'border-[var(--success)]/40',
    icon: 'bg-[var(--success)]/15 text-[var(--success)]',
  },
  error: { box: 'border-[var(--danger)]/45', icon: 'bg-[var(--danger)]/15 text-[var(--danger)]' },
  info: { box: 'border-[var(--primary)]/40', icon: 'bg-[var(--primary)]/15 text-[var(--primary)]' },
}

const ICONS: Record<ToastItem['kind'], string> = { success: '✓', error: '!', info: 'i' }

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(() => subscribeToasts(setItems), [])

  return (
    <div
      aria-live="polite"
      className="fixed z-[200] bottom-[76px] md:bottom-5 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 w-[calc(100%-32px)] max-w-sm flex flex-col gap-2 pointer-events-none"
    >
      {items.map((t) => (
        <div
          key={t.id}
          role={t.kind === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border bg-[var(--surface)] shadow-xl text-sm text-[var(--text)] motion-safe:animate-[kf-toast-in_0.25s_ease-out] ${STYLES[t.kind].box}`}
        >
          <span
            aria-hidden="true"
            className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-black ${STYLES[t.kind].icon}`}
          >
            {ICONS[t.kind]}
          </span>
          <p className="flex-1 min-w-0 font-semibold leading-snug pt-0.5">{t.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 -mr-1 -mt-1 w-7 h-7 rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-soft)] cursor-pointer"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
