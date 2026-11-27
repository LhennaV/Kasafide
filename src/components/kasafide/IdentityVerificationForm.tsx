'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitIdentityVerificationAction } from '@/app/actions/kasafide'
import type { PortalUserSummary } from '@/lib/portal-guard'
import { toast } from '@/lib/toast'
import { uploadFile } from '@/lib/upload-client'

type IdType = 'drivers_license' | 'passport' | 'philid' | 'umid' | 'postal_id'
type Stored = { path: string; preview: string }

const FAILED = { ok: false, error: 'Could not reach the server. Please try again.' } as const

/**
 * Step 1: ID type + last 4 digits + a photo of the ID (uploaded to the private bucket).
 * Step 2: a live selfie taken with the device camera inside the page, not picked from the
 * gallery, so the admin compares a real face against the ID portrait.
 * Nothing is marked "captured" until a file has actually been uploaded.
 */
export function IdentityVerificationForm({
  currentStatus,
}: {
  currentStatus: PortalUserSummary['accountStatus']
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [idType, setIdType] = useState<IdType>('philid')
  const [last4, setLast4] = useState('')
  const [idPhoto, setIdPhoto] = useState<Stored | null>(null)
  const [selfie, setSelfie] = useState<Stored | null>(null)
  const [busy, setBusy] = useState<'' | 'id' | 'selfie'>('')
  const [error, setError] = useState('')

  async function onIdFile(file: File | undefined) {
    if (!file) return
    setError('')
    setBusy('id')
    const res = await uploadFile('id-photo', file)
    setBusy('')
    if (!res.ok) return setError(res.error)
    setIdPhoto({ path: res.path, preview: URL.createObjectURL(file) })
  }

  async function onSelfie(blob: Blob) {
    setError('')
    setBusy('selfie')
    const res = await uploadFile('selfie', blob)
    setBusy('')
    if (!res.ok) return setError(res.error)
    setSelfie({ path: res.path, preview: URL.createObjectURL(blob) })
  }

  const ready = last4.length === 4 && idPhoto && selfie && !busy

  return (
    <div data-tour="verify-form" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 w-full space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
          Current Verification Status
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
            currentStatus === 'verified'
              ? 'bg-[var(--success)]/15 text-[var(--success)]'
              : 'bg-[var(--warning)]/15 text-[var(--warning)]'
          }`}
        >
          {currentStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">
              Step 1 &middot; Select Valid Philippine Government ID
            </label>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value as IdType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            >
              <option value="philid">PhilSys National ID</option>
              <option value="drivers_license">LTO Driver&apos;s License</option>
              <option value="passport">Philippine Passport</option>
              <option value="umid">UMID Card</option>
              <option value="postal_id">Postal ID</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Last 4 Digits of ID Number</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="e.g. 9012"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Photo of the Front of Your ID</label>
            <label
              className={`block w-full rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition ${
                idPhoto
                  ? 'border-[var(--success)] bg-[var(--success)]/10'
                  : 'border-[var(--border)] hover:border-[var(--primary)]'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={busy !== ''}
                onChange={(e) => {
                  void onIdFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              {idPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element -- local preview blob
                <img src={idPhoto.preview} alt="Your ID" className="mx-auto max-h-44 rounded-xl object-contain" />
              ) : null}
              <div
                className={`font-extrabold text-sm mt-2 ${idPhoto ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}
              >
                {busy === 'id'
                  ? 'Uploading…'
                  : idPhoto
                    ? '✓ ID photo uploaded · tap to replace'
                    : 'Tap to upload or take a photo of your ID'}
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5">Step 2 &middot; In-App Camera Selfie Check</label>
          <SelfieCamera
            captured={selfie?.preview || null}
            uploading={busy === 'selfie'}
            onCapture={(blob) => void onSelfie(blob)}
            onRetake={() => setSelfie(null)}
          />
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Kasafide admins compare your live selfie directly against your government ID portrait.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs font-bold text-[var(--danger)]">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={isPending || !ready}
        onClick={() => {
          if (!idPhoto || !selfie) return
          startTransition(async () => {
            const res = await submitIdentityVerificationAction({
              idType,
              idNumberLast4: last4,
              idImagePath: idPhoto.path,
              selfieImagePath: selfie.path,
            }).catch(() => FAILED)
            toast.result(res, 'Submitted!')
            if (res.ok) {
              setIdPhoto(null)
              setSelfie(null)
              setLast4('')
              router.refresh()
            }
          })
        }}
        className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
      >
        {isPending ? 'Submitting…' : 'Submit for Admin Verification'}
      </button>
      {!ready && !isPending && (
        <p className="text-[11px] text-center text-[var(--text-muted)] -mt-2">
          Complete the last 4 digits, the ID photo, and the live selfie to submit.
        </p>
      )}
    </div>
  )
}

function SelfieCamera({
  captured,
  uploading,
  onCapture,
  onRetake,
}: {
  captured: string | null
  uploading: boolean
  onCapture: (blob: Blob) => void
  onRetake: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [live, setLive] = useState(false)
  const [camError, setCamError] = useState('')

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setLive(false)
  }

  useEffect(() => stop, [])

  async function start() {
    setCamError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError('This browser cannot open the camera. Please use Chrome or Safari on your phone.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream
      setLive(true)
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          void videoRef.current.play().catch(() => {})
        }
      })
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      setCamError(
        name === 'NotAllowedError'
          ? 'Camera permission was blocked. Allow camera access for this site in your browser settings, then try again.'
          : 'Could not open the camera. Make sure no other app is using it, then try again.',
      )
    }
  }

  function snap() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Only the on-screen preview is mirrored (CSS); the saved frame is the real orientation.
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (blob) {
          stop()
          onCapture(blob)
        }
      },
      'image/jpeg',
      0.9,
    )
  }

  if (captured) {
    return (
      <div className="rounded-2xl border-2 border-[var(--success)] bg-[var(--success)]/10 p-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- local preview blob */}
        <img src={captured} alt="Your selfie" className="mx-auto max-h-56 rounded-xl object-contain" />
        <div className="font-extrabold text-sm text-[var(--success)] mt-2">
          {uploading ? 'Uploading…' : '✓ Live selfie captured'}
        </div>
        {!uploading && (
          <button
            type="button"
            onClick={() => {
              onRetake()
              void start()
            }}
            className="mt-2 text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
          >
            Retake selfie
          </button>
        )}
      </div>
    )
  }

  if (live) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-black overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full max-h-72 object-cover -scale-x-100"
        />
        <div className="flex gap-2 p-3 bg-[var(--surface)]">
          <button
            type="button"
            onClick={snap}
            disabled={uploading}
            className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Capture Selfie'}
          </button>
          <button
            type="button"
            onClick={stop}
            className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-bold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void start()}
        className="w-full p-5 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-muted)] text-center transition cursor-pointer"
      >
        <div className="font-extrabold text-sm">Tap to Open Camera for Live Selfie</div>
        <div className="text-xs mt-1">Hold your ID beside your face so both are visible.</div>
      </button>
      {camError && (
        <p role="alert" className="text-xs font-bold text-[var(--danger)] mt-2">
          {camError}
        </p>
      )}
    </div>
  )
}
