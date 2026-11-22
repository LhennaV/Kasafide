import { redirect } from 'next/navigation'
import { DEMO_ACCOUNTS, type DemoRole, loginDemoSession } from '@/lib/demo-accounts'

/**
 * GET /api/app-auth/demo?role=buyer&redirect=/module/buyer
 * Allows direct 1-click links: <a href="/api/app-auth/demo?role=seller">
 * No sign in or sign up needed!
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const roleParam = (url.searchParams.get('role') || 'buyer') as DemoRole
  const customRedirect = url.searchParams.get('redirect')

  const validRole: DemoRole = DEMO_ACCOUNTS[roleParam] ? roleParam : 'buyer'
  const session = await loginDemoSession(validRole)

  const targetPath = customRedirect || session.redirectTo || DEMO_ACCOUNTS[validRole].homePath
  return redirect(targetPath)
}

/**
 * POST /api/app-auth/demo
 * Body: { role: 'buyer' | 'seller' | 'admin' | 'superadmin' }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      role?: DemoRole
      demoRole?: DemoRole
      redirect?: string
    }

    const requestedRole = (body.role || body.demoRole || 'buyer') as DemoRole
    const validRole: DemoRole = DEMO_ACCOUNTS[requestedRole] ? requestedRole : 'buyer'

    const session = await loginDemoSession(validRole)

    return Response.json({
      ok: true,
      role: validRole,
      redirectTo: body.redirect || session.redirectTo,
      user: {
        id: String(session.user.id),
        name: session.user.fullName,
        email: session.user.email,
        role: session.user.role,
      },
    })
  } catch (err) {
    console.error('Error activating demo session:', err)
    return Response.json(
      { error: 'Failed to activate demo preview. Please try again.' },
      { status: 500 },
    )
  }
}
