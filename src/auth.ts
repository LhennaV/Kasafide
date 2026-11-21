import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import {
  CSRF_COOKIE,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  SESSION_MAX_AGE,
} from '@/lib/session-cookie'
import { syncGoogleUserToPayload } from '@/lib/oauth-user-sync'

// Pin AUTH_URL to NEXT_PUBLIC_SITE_URL before NextAuth() runs, skipping localhost
if (
  !process.env.AUTH_URL &&
  process.env.NEXT_PUBLIC_SITE_URL &&
  !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
) {
  process.env.AUTH_URL = process.env.NEXT_PUBLIC_SITE_URL
}

// Bare Google provider reads AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Google],
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE },
  cookies: {
    sessionToken: { name: SESSION_COOKIE, options: SESSION_COOKIE_OPTIONS },
    csrfToken: { name: CSRF_COOKIE, options: SESSION_COOKIE_OPTIONS },
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google' && profile?.sub) {
        const synced = await syncGoogleUserToPayload({
          providerId: String(profile.sub),
          email: typeof profile.email === 'string' ? profile.email : null,
          name: typeof profile.name === 'string' ? profile.name : null,
          givenName:
            typeof (profile as { given_name?: unknown }).given_name === 'string'
              ? ((profile as { given_name: string }).given_name)
              : null,
          familyName:
            typeof (profile as { family_name?: unknown }).family_name === 'string'
              ? ((profile as { family_name: string }).family_name)
              : null,
          picture:
            typeof (profile as { picture?: unknown }).picture === 'string'
              ? ((profile as { picture: string }).picture)
              : null,
        })
        token.appUserId = String(synced.id)
        token.role = synced.role
        token.name = synced.fullName
        token.email = synced.email
        token.picture = synced.avatarUrl || undefined
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { id?: string; role?: string }).id =
          typeof token.appUserId === 'string' ? token.appUserId : undefined
        ;(session.user as { id?: string; role?: string }).role =
          typeof token.role === 'string' ? token.role : 'buyer'
      }
      return session
    },
  },
})
