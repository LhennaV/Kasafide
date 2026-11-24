import { appAuth, getRoleHomePath } from '@/lib/app-auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: unknown
      password?: unknown
    } | null

    let email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    let password = typeof body?.password === 'string' ? body.password : ''

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

    // 2. Try Payload local auth
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
      {
        error:
          msg && !msg.includes('credentials')
            ? `Login failed: ${msg}`
            : 'Invalid email or password. Please check your credentials and try again.',
      },
      { status: 401 },
    )
  }
}
