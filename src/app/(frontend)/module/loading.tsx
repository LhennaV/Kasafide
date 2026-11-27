/**
 * Shown the instant a portal link is tapped, while the server prepares the next page. Without
 * it the old page just sat there until the new one arrived, which looked like the tap did
 * nothing (most noticeable on phones and on the profile menu).
 */
export default function PortalLoading() {
  return (
    <div className="min-h-screen flex bg-[var(--bg)]" aria-busy="true" aria-live="polite">
      <div className="hidden md:block w-[72px] shrink-0 bg-[var(--sidebar-bg)]" />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="h-15 border-b border-[var(--border)] bg-[var(--surface)]" />
        <div className="p-4 sm:p-7 space-y-4 animate-pulse">
          <div className="h-8 w-56 rounded-xl bg-[var(--surface-soft)]" />
          <div className="h-4 w-80 max-w-full rounded-lg bg-[var(--surface-soft)]" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="h-28 rounded-3xl bg-[var(--surface-soft)]" />
            <div className="h-28 rounded-3xl bg-[var(--surface-soft)]" />
            <div className="h-28 rounded-3xl bg-[var(--surface-soft)]" />
          </div>
          <div className="h-64 rounded-3xl bg-[var(--surface-soft)]" />
          <span className="sr-only">Loading…</span>
        </div>
      </div>
    </div>
  )
}
