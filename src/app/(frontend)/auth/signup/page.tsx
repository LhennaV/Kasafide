import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SignUpClient } from '@/components/kasafide/SignUpClient'

export const metadata: Metadata = {
  title: 'Kasafide – Create an Account',
  description: 'Register as a Buyer/Renter or Verified Seller on Kasafide Sta. Maria, Bulacan.',
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <SignUpClient />
    </Suspense>
  )
}
