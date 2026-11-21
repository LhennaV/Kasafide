import { cookies } from 'next/headers'
import BridgeClient from './BridgeClient'

export default async function PreviewSignInBridgePage() {
  const cookieStore = await cookies()
  const bootstrapCsrf = cookieStore.get('__Host-pv_bootstrap')?.value || ''
  return <BridgeClient bootstrapCsrf={bootstrapCsrf} />
}
