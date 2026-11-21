import { appAuth, getRoleHomePath } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { createClient } from '@/lib/supabase/server'

const DEMO_ACCOUNTS: Record<string, { email: string; password: string; role: 'buyer' | 'seller' | 'admin' | 'superadmin' }> = {
  buyer: { email: 'buyer@kasafide.ph', password: 'KasafideDemo2026!', role: 'buyer' },
  seller: { email: 'seller@kasafide.ph', password: 'KasafideDemo2026!', role: 'seller' },
  admin: { email: 'admin@kasafide.ph', password: 'KasafideDemo2026!', role: 'admin' },
  superadmin: { email: 'superadmin@kasafide.ph', password: 'KasafideDemo2026!', role: 'superadmin' },
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
      const demoConfig = DEMO_ACCOUNTS[body.demoRole]
      email = demoConfig.email
      password = demoConfig.password

      // Auto-provision demo account on the database if it doesn't exist yet
      try {
        const payload = await getPayloadClient()
        const existing = await payload.find({
          collection: 'users',
          where: { email: { equals: email } },
          limit: 1,
        })

        if (existing.docs.length === 0) {
          const roleSlug = demoConfig.role === 'superadmin' ? 'super_duper_admin' : demoConfig.role
          await payload.create({
            collection: 'users',
            overrideAccess: true,
            context: { trustedSeedOrOAuth: true },
            data: {
              email,
              password,
              firstName: demoConfig.role.charAt(0).toUpperCase() + demoConfig.role.slice(1),
              lastName: 'Kasafide',
              fullName: `${demoConfig.role.charAt(0).toUpperCase() + demoConfig.role.slice(1)} Demo`,
              role: roleSlug,
              accountStatus: 'verified',
              authProvider: 'local',
            },
          })
        }
      } catch (seedErr) {
        console.warn('Demo auto-provision warning:', seedErr)
      }
    }

    if (!email || !password) {
      return Response.json({ error: 'Please enter both your email and password.' }, { status: 400 })
    }

    // 1. Try Supabase Auth first (for credentials stored in auth.users)
    try {
      const supabase = await createClient()
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!sbError && sbData?.user) {
        const user = await appAuth.getCurrentUser()
        if (user) {
          if (user.accountStatus === 'suspended') {
            await supabase.auth.signOut()
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
        }
      }
    } catch (sbErr) {
      console.warn('Supabase signin attempt bypassed:', sbErr)
    }

    // 2. Try Payload local auth (for demo and admin accounts)
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
  } catch (err) {
    console.error('Login error details:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json(
      { error: msg && !msg.includes('credentials') ? `Login failed: ${msg}` : 'Invalid email or password. Please check your credentials and try again.' },
      { status: 401 },
    )
  }
}
