import { appAuth } from '@/lib/app-auth'
import type { Media } from '@/payload-types'

export async function GET() {
  const user = await appAuth.getCurrentUser()
  if (!user) {
    return Response.json(null, {
      headers: { 'cache-control': 'no-store' },
    })
  }

  const avatarMedia =
    user.avatar && typeof user.avatar === 'object' ? (user.avatar as Media) : null

  return Response.json(
    {
      user: {
        id: String(user.id),
        name: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        image: avatarMedia?.url || user.avatarUrl || null,
        role: user.role,
        accountStatus: user.accountStatus,
        authProvider: user.authProvider || 'local',
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      headers: { 'cache-control': 'no-store' },
    },
  )
}
