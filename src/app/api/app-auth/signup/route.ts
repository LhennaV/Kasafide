import { getPayloadClient } from '@/lib/payload'
import { appAuth, getRoleHomePath } from '@/lib/app-auth'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      role?: unknown
      firstName?: unknown
      lastName?: unknown
      middleInitial?: unknown
      email?: unknown
      phone?: unknown
      password?: unknown
    } | null

    const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : ''
    const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : ''
    const middleInitial = typeof body?.middleInitial === 'string' ? body.middleInitial.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const phoneRaw = typeof body?.phone === 'string' ? body.phone.replace(/\D/g, '').slice(0, 10) : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    const role = body?.role === 'seller' ? 'seller' : 'buyer'

    if (!firstName || !lastName) {
      return Response.json({ error: 'Please enter your first name and surname.' }, { status: 400 })
    }
    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (password.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 },
      )
    }

    const fullName = [firstName, middleInitial ? `${middleInitial.replace(/\.$/, '')}.` : '', lastName]
      .filter(Boolean)
      .join(' ')

    // 1. Create in Supabase Auth (auth.users)
    try {
      const supabase = await createSupabaseClient()
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            role,
          },
        },
      })
    } catch (sbErr) {
      console.warn('Supabase signup notice:', sbErr)
    }

    const payload = await getPayloadClient()

    // 2. Create in Payload users collection
    await payload.create({
      collection: 'users',
      overrideAccess: false,
      context: { isPublicSelfSignup: true },
      data: {
        firstName,
        middleInitial: middleInitial || undefined,
        lastName,
        fullName,
        email,
        phone: phoneRaw ? `+63${phoneRaw}` : undefined,
        password,
        role,
        accountStatus: 'unverified',
        authProvider: 'local',
      },
    })

    const loggedIn = await appAuth.loginWithEmailPassword(email, password)

    return Response.json({
      ok: true,
      redirectTo: getRoleHomePath(loggedIn.role),
      user: {
        id: String(loggedIn.id),
        name: loggedIn.fullName,
        email: loggedIn.email,
        role: loggedIn.role,
      },
    })
  } catch (err) {
    console.error('Signup error details:', err)
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('unique')) {
      return Response.json(
        { error: 'An account with this email already exists. Try signing in instead.' },
        { status: 409 },
      )
    }
    return Response.json(
      { error: `Unable to create your account: ${msg || 'Please verify your details.'}` },
      { status: 400 },
    )
  }
}
