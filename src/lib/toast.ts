/**
 * A tiny global toast queue (the React version of the original site's hsToast).
 * Call `toast.success('Saved!')` or `toast.error('...')` from any client component;
 * <Toaster /> (rendered by PortalShell) shows them.
 */
export type ToastKind = 'success' | 'error' | 'info'
export type ToastItem = { id: number; kind: ToastKind; message: string }

type Listener = (items: ToastItem[]) => void

const DURATION_MS: Record<ToastKind, number> = { success: 3200, info: 3200, error: 5500 }
const MAX_VISIBLE = 4

let items: ToastItem[] = []
let nextId = 1
const listeners = new Set<Listener>()

function emit() {
  for (const l of listeners) l(items)
}

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id)
  emit()
}

function push(kind: ToastKind, message: string) {
  if (!message) return
  const id = nextId++
  items = [...items, { id, kind, message }].slice(-MAX_VISIBLE)
  emit()
  if (typeof window !== 'undefined') {
    window.setTimeout(() => dismissToast(id), DURATION_MS[kind])
  }
}

export const toast = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message),
  info: (message: string) => push('info', message),
  /** Shows a server action's result: its message on success, its error otherwise. */
  result: (res: { ok: boolean; message?: string; error?: string }, fallback = 'Saved.') =>
    res.ok
      ? push('success', res.message || fallback)
      : push('error', res.error || 'Something went wrong. Please try again.'),
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener)
  listener(items)
  return () => {
    listeners.delete(listener)
  }
}

type ActionLike = { ok: boolean; message?: string; error?: string }

/**
 * Wraps a server-action call so the result always reaches the person: a toast on success
 * (unless `quiet`) and on failure, including when the request itself never comes back.
 */
export async function withToast<T extends ActionLike>(
  call: Promise<T>,
  opts: { quiet?: boolean; fallback?: string } = {},
): Promise<T | { ok: false; error: string }> {
  try {
    const res = await call
    if (!res.ok || !opts.quiet) toast.result(res, opts.fallback)
    return res
  } catch {
    const failed = { ok: false as const, error: 'Could not reach the server. Please try again.' }
    toast.error(failed.error)
    return failed
  }
}
