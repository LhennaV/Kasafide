import { appAuth } from '@/lib/app-auth'

export async function POST() {
  await appAuth.clearLocalSession()
  return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } })
}
