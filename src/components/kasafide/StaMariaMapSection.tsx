'use client'

import { useEffect, useState } from 'react'
import type { BarangayPinView } from '@/lib/kasafide-data'

const VB_W = 1575
const VB_H = 1816

export function StaMariaMapSection({
  barangays,
  onSelectBarangay,
}: {
  barangays: BarangayPinView[]
  onSelectBarangay?: (slug: string) => void
}) {
  const [svgMarkup, setSvgMarkup] = useState<string>('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let cancelled = false
    fetch('/assets/img/Sta. Maria Map.svg')
      .then((res) => res.text())
      .then((txt) => {
        if (!cancelled) setSvgMarkup(txt)
      })
      .catch(() => null)
    return () => {
      cancelled = true
    }
  }, [])

  const activeBarangays = barangays
    .filter((b) => b.listingCount > 0)
    .sort((a, b) => b.listingCount - a.listingCount || a.name.localeCompare(b.name))

  function chooseBarangay(slug: string) {
    if (onSelectBarangay) {
      onSelectBarangay(slug)
      const target = document.getElementById('browse')
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section id="map" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5">
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[var(--primary)] mb-2">
            Explore the Map
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text)] mb-3">
            Every Barangay in Sta. Maria
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-6">
            Each pulsing pin marks a barangay with verified live listings. Tap a pin or choose a barangay below to filter properties immediately.
          </p>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Barangays with Live Listings
              </span>
              <span className="text-xs font-bold text-[var(--primary)]">
                {barangays.length} Total Covered
              </span>
            </div>

            {activeBarangays.length > 0 ? (
              <div className="flex flex-wrap lg:flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {activeBarangays.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => chooseBarangay(b.slug)}
                    className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-[var(--surface-soft)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-sm font-semibold text-[var(--text)] transition cursor-pointer"
                  >
                    <span>{b.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-[var(--bg)]/60 text-[var(--text)]">
                      {b.listingCount}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] py-3">No live listings yet.</p>
            )}
          </div>

          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Drag map to pan &middot; Use + / &minus; controls on mobile or desktop to zoom
          </p>
        </div>

        <div className="lg:col-span-7">
          <div
            className="relative h-[430px] sm:h-[520px] rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden select-none touch-none shadow-lg"
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest('[data-map-control]')) return
              setDragging(true)
              setDragOrigin({ x: e.clientX - pan.x, y: e.clientY - pan.y })
            }}
            onPointerMove={(e) => {
              if (!dragging) return
              setPan({ x: e.clientX - dragOrigin.x, y: e.clientY - dragOrigin.y })
            }}
            onPointerUp={() => setDragging(false)}
            onPointerLeave={() => setDragging(false)}
          >
            <div
              data-map-control="true"
              className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-1.5 bg-[var(--bg)]/85 backdrop-blur-md p-1.5 rounded-2xl border border-[var(--border)]"
            >
              <button
                type="button"
                aria-label="Zoom in map"
                onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.25).toFixed(2)))}
                className="w-9 h-9 rounded-xl bg-[var(--surface)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] font-extrabold text-base flex items-center justify-center cursor-pointer"
              >
                +
              </button>
              <button
                type="button"
                aria-label="Zoom out map"
                onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.25).toFixed(2)))}
                className="w-9 h-9 rounded-xl bg-[var(--surface)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] font-extrabold text-base flex items-center justify-center cursor-pointer"
              >
                &minus;
              </button>
              <button
                type="button"
                aria-label="Reset map view"
                onClick={() => {
                  setZoom(1)
                  setPan({ x: 0, y: 0 })
                }}
                className="w-9 h-9 rounded-xl bg-[var(--surface)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-[10px] font-bold flex items-center justify-center cursor-pointer"
              >
                RST
              </button>
            </div>

            <div
              className="w-full h-full flex items-center justify-center p-4"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              <div className="relative h-full aspect-[1575/1816] max-w-full">
                {svgMarkup ? (
                  <div
                    className="w-full h-full [&_svg]:w-full [&_svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: svgMarkup }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
                    Loading Sta. Maria municipal map…
                  </div>
                )}

                {activeBarangays.map((b) => {
                  const leftPct = `${((b.mapX / VB_W) * 100).toFixed(2)}%`
                  const topPct = `${((b.mapY / VB_H) * 100).toFixed(2)}%`
                  return (
                    <button
                      key={b.id}
                      type="button"
                      data-map-control="true"
                      onClick={() => chooseBarangay(b.slug)}
                      style={{ left: leftPct, top: topPct }}
                      aria-label={`${b.listingCount} verified properties in ${b.name}`}
                      className="group absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
                    >
                      <span className="kf-marker-pulse absolute inset-0 rounded-full bg-[#FF8A65]" />
                      <span className="relative w-8 h-8 rounded-full bg-[#5B3A8E] border-2 border-[#FF8A65] text-[#FBF6F0] flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <span className="text-[11px] font-extrabold">{b.listingCount}</span>
                      </span>
                      <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#2B1B3D] text-[#FBF6F0] text-[11px] font-bold shadow-lg border border-white/15">
                        {b.name} ({b.listingCount})
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
