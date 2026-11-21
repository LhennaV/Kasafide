'use client'

import React from 'react'
import { GoogleAuthButton as SupabaseGoogleAuthButton } from '@/components/auth/GoogleAuthButton'

export function GoogleAuthButton({
  mode = 'signin',
  preferredRole = 'buyer',
  redirectTo,
}: {
  mode?: 'signin' | 'signup'
  preferredRole?: 'buyer' | 'seller'
  redirectTo?: string
}) {
  const destination = redirectTo || (preferredRole === 'seller' ? '/module/seller' : '/module/buyer')
  const label = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'

  return <SupabaseGoogleAuthButton label={label} redirectTo={destination} />
}
