import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

// Payload's default /admin/logout lands on /admin/login.
// In Figma Make's preview iframe auto-login, it routed through Figma SSO logout.
// For standalone mode, redirect to /admin/login (or fallback site root).
export function GET(request: NextRequest) {
  const host = request.headers.get('host')
  const viewerOrigin = host ? `${request.nextUrl.protocol}//${host}` : undefined
  const origin = process.env.FIGMA_PUBLIC_URL || viewerOrigin || 'http://localhost:3000'
  const logoutRedirect = new URL('/', origin).toString()

  if (process.env.FIGMA) {
    // Logout is a collection endpoint in Figma Make with SSO
    redirect(`/api/admins/sso/logout?redirect=${encodeURIComponent(logoutRedirect)}`)
  }

  redirect('/admin/login')
}
