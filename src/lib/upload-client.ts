'use client'

export type UploadKind = 'listing-photo' | 'avatar' | 'id-photo' | 'selfie' | 'ownership-doc'

export type UploadResult =
  | { ok: true; path: string; url: string | null }
  | { ok: false; error: string }

const MAX_EDGE = 1600
const JPEG_QUALITY = 0.85

/**
 * Shrinks a photo to at most 1600px on its longest side and re-encodes it as JPEG, so a 12 MB
 * phone photo becomes a few hundred KB and stays under the server's upload limit. Files the
 * browser can't decode (PDFs, HEIC on most browsers) are returned unchanged.
 */
export async function shrinkImage(file: Blob, name = 'photo.jpg'): Promise<File> {
  const asFile = file instanceof File ? file : new File([file], name, { type: file.type })
  if (!asFile.type.startsWith('image/') || asFile.type === 'image/gif') return asFile
  try {
    const bitmap = await createImageBitmap(asFile)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    )
    if (!blob) return asFile
    return new File([blob], asFile.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return asFile
  }
}

export async function uploadFile(kind: UploadKind, file: Blob): Promise<UploadResult> {
  const prepared = await shrinkImage(file)
  const body = new FormData()
  body.append('kind', kind)
  body.append('file', prepared)
  try {
    const res = await fetch('/api/uploads', { method: 'POST', body })
    const data = (await res.json().catch(() => null)) as UploadResult | null
    if (!data) return { ok: false, error: `Upload failed (${res.status}).` }
    return data
  } catch {
    return { ok: false, error: 'Upload failed. Please check your connection and try again.' }
  }
}
