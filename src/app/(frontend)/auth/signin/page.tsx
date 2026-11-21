import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SignInClient } from '@/components/kasafide/SignInClient'

export const metadata: Metadata = {
  title: 'Kasafide – Sign In',
  description: 'Sign in to your Kasafide buyer, seller, or administrator account.',
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <SignInClient />
    </Suspense>
  )
}
