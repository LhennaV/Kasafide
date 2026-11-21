import type { Metadata } from 'next'
import { ForgotPasswordClient } from './ForgotPasswordClient'

export const metadata: Metadata = {
  title: 'Kasafide – Forgot Password',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}
