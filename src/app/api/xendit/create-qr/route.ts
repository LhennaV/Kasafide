import { NextResponse } from 'next/server'
import { createQrCode } from '@/lib/xendit'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { listingId, amount = 1000, referenceCode } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    // Authenticate user with Supabase SSR
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const refId = referenceCode || `KF-QR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // Call Xendit QR Ph API
    const qrResult = await createQrCode({
      referenceId: refId,
      amount: Number(amount),
      currency: 'PHP',
      type: 'DYNAMIC',
    })

    return NextResponse.json({
      success: true,
      referenceId: refId,
      qrString: qrResult.qr_string,
      amount: qrResult.amount,
      status: qrResult.status,
      userId: user?.id ?? null,
      listingId: listingId ?? null,
    })
  } catch (error) {
    console.error('Error generating Xendit QR Code:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate QR Code' },
      { status: 500 }
    )
  }
}
