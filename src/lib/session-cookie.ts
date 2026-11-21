export const SESSION_COOKIE = '__Host-authjs.session-token'
export const CSRF_COOKIE = '__Host-authjs.csrf-token'
// Seconds; Auth.js default (30 days). Change only here.
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
  partitioned: true,
} as const
