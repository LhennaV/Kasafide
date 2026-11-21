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
  const [pathname, search = ''] = src.split('?')
  if (!PAYLOAD_FILE_PATH_PATTERN.test(pathname)) {
    return src
  }
  const searchParams = new URLSearchParams(search)
  searchParams.set('w', String(width))
  if (quality !== undefined) {
    searchParams.set('q', String(quality))
  }
  return `${pathname}?${searchParams}`
}
