import { appAuth, getRoleHomePath } from '@/lib/app-auth'

const DEMO_ACCOUNTS: Record<string, { email: string; password: string }> = {
  buyer: { email: 'buyer@kasafide.ph', password: 'KasafideDemo2026!' },
  seller: { email: 'seller@kasafide.ph', password: 'KasafideDemo2026!' },
  admin: { email: 'admin@kasafide.ph', password: 'KasafideDemo2026!' },
  superadmin: { email: 'superadmin@kasafide.ph', password: 'KasafideDemo2026!' },
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: unknown
      password?: unknown
      demoRole?: unknown
    } | null

    let email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    let password = typeof body?.password === 'string' ? body.password : ''

    if (typeof body?.demoRole === 'string' && DEMO_ACCOUNTS[body.demoRole]) {
      email = DEMO_ACCOUNTS[body.demoRole].email
      password = DEMO_ACCOUNTS[body.demoRole].password
    }

    if (!email || !password) {
      return Response.json({ error: 'Please enter both your email and password.' }, { status: 400 })
    }

    const user = await appAuth.loginWithEmailPassword(email, password)
    if (user.accountStatus === 'suspended') {
      await appAuth.clearLocalSession()
      return Response.json(
        { error: 'This account is currently suspended. Please contact Kasafide support.' },
        { status: 403 },
      )
    }

    return Response.json({
      ok: true,
      redirectTo: getRoleHomePath(user.role),
      user: {
        id: String(user.id),
        name: user.fullName,
        email: user.email,
        role: user.role,
      },
    })
  } catch {
    return Response.json(
      { error: 'Invalid email or password. Please check your credentials and try again.' },
      { status: 401 },
    )
  }
}
