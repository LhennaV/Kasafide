import type { Metadata } from 'next'
import { ResetPasswordClient } from './ResetPasswordClient'

export const metadata: Metadata = {
  title: 'Kasafide – Reset Password',
  robots: { index: false },
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const { token } = await searchParams
  return <ResetPasswordClient token={typeof token === 'string' ? token : ''} />
}
