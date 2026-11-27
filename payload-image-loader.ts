'use client'

const PAYLOAD_FILE_PATH_PATTERN = /^\/(?!\/)(?:.+\/)?api\/[^/]+\/file\/.+$/

export default function payloadNextImageLoader({
  quality,
  src,
  width,
}: {
  quality?: number
  src: string
  width: number
}): string {
  // data:/blob: previews can't carry a query string.
  if (src.startsWith('data:') || src.startsWith('blob:')) return src

  const [pathname, search = ''] = src.split('?')
  if (!PAYLOAD_FILE_PATH_PATTERN.test(pathname)) {
    // Outside images (Supabase Storage photos, Google avatars, Unsplash…) aren't resized here,
    // but Next.js requires the width in every URL a custom loader returns, or it shows the
    // "Missing `width` in the URL returned by the loader" error. Hosts ignore an unknown `w`.
    const sep = src.includes('?') ? '&' : '?'
    return `${src}${sep}w=${width}`
  }
  const searchParams = new URLSearchParams(search)
  searchParams.set('w', String(width))
  if (quality !== undefined) {
    searchParams.set('q', String(quality))
  }
  return `${pathname}?${searchParams}`
}
