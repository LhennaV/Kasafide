import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export function GET(_request: NextRequest) {
  redirect('/admin/login')
}
