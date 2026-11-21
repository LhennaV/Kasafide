import { NextResponse } from 'next/server'
import { verifyWebhookToken } from '@/lib/xendit'
import config from '@/payload.config'
import { getPayload } from 'payload'

export async function POST(request: Request) {
  try {
    const callbackToken = request.headers.get('x-callback-token')

    if (!verifyWebhookToken(callbackToken)) {
      return NextResponse.json(
        { error: 'Unauthorized webhook request' },
        { status: 401 }
      )
    }

    const payloadEvent = await request.json()
    const externalId = payloadEvent.external_id || payloadEvent.reference_id
    const status = payloadEvent.status // 'PAID', 'COMPLETED', etc.

    if (externalId && (status === 'PAID' || status === 'COMPLETED')) {
      try {
        const payload = await getPayload({ config })
        const existing = await payload.find({
          collection: 'payments',
          where: { referenceCode: { equals: externalId } },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'payments',
            id: existing.docs[0].id,
            data: {
              status: 'confirmed',
              notes: `Paid via Xendit webhook at ${new Date().toISOString()}`,
            },
          })
        }
      } catch (dbErr) {
        console.error('Database update on webhook failed:', dbErr)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
