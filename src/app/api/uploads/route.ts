import { appAuth } from '@/lib/app-auth'
import { storeUpload, UploadError, UPLOAD_RULES, type UploadKind } from '@/lib/storage'

/**
 * POST multipart/form-data { kind, file } → { ok, path, url }
 *
 * Stores one file for the signed-in user. The returned `path` (and `url` for public files) is
 * then passed to the server action that saves the form; the action re-checks that the path
 * belongs to the same user before attaching it to anything.
 */
export async function POST(request: Request) {
  const user = await appAuth.getCurrentUser()
  if (!user) {
    return Response.json({ ok: false, error: 'Please sign in first.' }, { status: 401 })
  }

  const form = await request.formData().catch(() => null)
  const kind = form?.get('kind')
  const file = form?.get('file')

  if (typeof kind !== 'string' || !(kind in UPLOAD_RULES)) {
    return Response.json({ ok: false, error: 'Unknown upload type.' }, { status: 400 })
  }
  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: 'No file was attached.' }, { status: 400 })
  }
  if (kind === 'listing-photo' && user.role !== 'seller') {
    return Response.json({ ok: false, error: 'Only sellers can upload listing photos.' }, { status: 403 })
  }

  try {
    const stored = await storeUpload(String(user.id), kind as UploadKind, file)
    return Response.json({ ok: true, ...stored }, { headers: { 'cache-control': 'no-store' } })
  } catch (err) {
    if (err instanceof UploadError) {
      return Response.json({ ok: false, error: err.message }, { status: 400 })
    }
    console.error('[uploads] failed:', err)
    const msg = err instanceof Error ? err.message : ''
    return Response.json(
      {
        ok: false,
        error: msg.includes('SUPABASE_SERVICE_ROLE_KEY')
          ? msg
          : 'Upload failed. Please check your connection and try again.',
      },
      { status: 500 },
    )
  }
}
