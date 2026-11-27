import { cookies } from 'next/headers'
import { appAuth } from '@/lib/app-auth'
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/session-cookie'

export async function POST() {
  await appAuth.clearLocalSession()

  // Belt and braces: also expire every other cookie that can sign a user back in, so pasting
  // a portal link after logging out always lands on the sign-in page.
  // - The Google (Auth.js) session cookie is __Host- + Partitioned; a browser only deletes a
  //   partitioned cookie when the deleting Set-Cookie carries the same attributes.
  // - Default Auth.js names and Payload's own cookie, in case either was ever set.
  const store = await cookies()
  store.set(SESSION_COOKIE, '', { ...SESSION_COOKIE_OPTIONS, maxAge: 0 })
  for (const name of [
    'authjs.session-token',
    '__Secure-authjs.session-token',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'payload-token',
  ]) {
    if (store.get(name)) {
      store.set(name, '', { path: '/', maxAge: 0, secure: name.startsWith('__Secure-') })
    }
  }

  return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } })
}
