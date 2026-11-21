import CallbackClient from './CallbackClient'

export default async function PreviewOAuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolved = await searchParams
  const hasQuery = Object.keys(resolved).length > 0
  return <CallbackClient rejectedQuery={hasQuery} />
}
