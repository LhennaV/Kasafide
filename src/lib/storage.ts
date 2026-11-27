import 'server-only'
import { randomUUID } from 'node:crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * File storage for Kasafide uploads (listing photos, ID photos, selfies, ownership documents,
 * profile pictures), kept in Supabase Storage so files survive a Netlify redeploy.
 *
 * Two buckets:
 * - PUBLIC_BUCKET  (public)  listing photos and profile pictures; anyone may view them.
 * - PRIVATE_BUCKET (private) ID photos, selfies, ownership documents; opened only through
 *   short-lived signed links that the server makes for the owner or an admin.
 *
 * Every stored path starts with the uploader's user id, which is how the server actions check
 * that a user only attaches files they uploaded themselves.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in the server environment. It bypasses Row Level Security, so it
 * must never be exposed to the browser (no NEXT_PUBLIC_ prefix).
 */

export const PUBLIC_BUCKET = process.env.SUPABASE_PUBLIC_BUCKET || 'listing-images'
export const PRIVATE_BUCKET = process.env.SUPABASE_PRIVATE_BUCKET || 'verification-docs'

export type UploadKind = 'listing-photo' | 'avatar' | 'id-photo' | 'selfie' | 'ownership-doc'

const MB = 1024 * 1024
// Netlify functions reject request bodies above ~6 MB, so stay under it. The browser shrinks
// photos before sending (see lib/upload-client.ts), so real photos land well below this.
const LIMIT = 5 * MB
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export const UPLOAD_RULES: Record<
  UploadKind,
  { bucket: 'public' | 'private'; folder: string; maxBytes: number; types: string[] }
> = {
  'listing-photo': { bucket: 'public', folder: 'listings', maxBytes: LIMIT, types: IMAGE_TYPES },
  avatar: { bucket: 'public', folder: 'avatars', maxBytes: LIMIT, types: IMAGE_TYPES },
  'id-photo': { bucket: 'private', folder: 'ids', maxBytes: LIMIT, types: IMAGE_TYPES },
  selfie: { bucket: 'private', folder: 'selfies', maxBytes: LIMIT, types: IMAGE_TYPES },
  'ownership-doc': {
    bucket: 'private',
    folder: 'ownership',
    maxBytes: LIMIT,
    types: [...IMAGE_TYPES, 'application/pdf'],
  },
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'application/pdf': 'pdf',
}

let cached: SupabaseClient | null = null

export function isStorageConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function adminClient(): SupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'File uploads are not set up yet: SUPABASE_SERVICE_ROLE_KEY is missing from the server environment.',
    )
  }
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return cached
}

const ensured = new Set<string>()

/** Creates the bucket the first time it is needed, so a fresh project needs no manual setup. */
async function ensureBucket(name: string, isPublic: boolean): Promise<void> {
  if (ensured.has(name)) return
  const sb = adminClient()
  const { data } = await sb.storage.getBucket(name)
  if (!data) {
    const { error } = await sb.storage.createBucket(name, { public: isPublic })
    if (error && !/already exists/i.test(error.message)) throw error
  }
  ensured.add(name)
}

function bucketName(which: 'public' | 'private'): string {
  return which === 'public' ? PUBLIC_BUCKET : PRIVATE_BUCKET
}

export async function storeUpload(
  userId: string,
  kind: UploadKind,
  file: File,
): Promise<{ path: string; url: string | null }> {
  const rule = UPLOAD_RULES[kind]
  if (!rule.types.includes(file.type)) {
    throw new UploadError(
      kind === 'ownership-doc'
        ? 'Please upload a photo (JPG, PNG, WEBP) or a PDF.'
        : 'Please upload a photo (JPG, PNG or WEBP).',
    )
  }
  if (file.size > rule.maxBytes) {
    throw new UploadError(`That file is too large. The limit is ${rule.maxBytes / MB} MB.`)
  }
  if (file.size === 0) throw new UploadError('That file is empty.')

  const bucket = bucketName(rule.bucket)
  await ensureBucket(bucket, rule.bucket === 'public')

  const path = `${userId}/${rule.folder}/${randomUUID()}.${EXTENSIONS[file.type] || 'bin'}`
  const sb = adminClient()
  const { error } = await sb.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error

  const url = rule.bucket === 'public' ? sb.storage.from(bucket).getPublicUrl(path).data.publicUrl : null
  return { path, url }
}

/** True when `path` is a file this user uploaded into the given folder. */
export function ownsPath(userId: string, kind: UploadKind, path: unknown): path is string {
  if (typeof path !== 'string') return false
  const prefix = `${userId}/${UPLOAD_RULES[kind].folder}/`
  return path.startsWith(prefix) && !path.includes('..') && path.length < 300
}

/** True when `url` is a public URL for a file this user uploaded into the given folder. */
export function ownsPublicUrl(userId: string, kind: UploadKind, url: unknown): url is string {
  if (typeof url !== 'string' || !process.env.NEXT_PUBLIC_SUPABASE_URL) return false
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${PUBLIC_BUCKET}/`
  return url.startsWith(base) && ownsPath(userId, kind, url.slice(base.length))
}

/** Short-lived link to a private file, for the owner or an admin. Null when it can't be made. */
export async function signedUrl(path: string | null | undefined, seconds = 600): Promise<string | null> {
  if (!path || !isStorageConfigured()) return null
  try {
    const { data, error } = await adminClient().storage.from(PRIVATE_BUCKET).createSignedUrl(path, seconds)
    if (error) return null
    return data.signedUrl
  } catch {
    return null
  }
}

export class UploadError extends Error {}
