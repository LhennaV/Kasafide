import { NextResponse } from 'next/server'
import { createInvoice } from '@/lib/xendit'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { listingId, amount, description = 'Kasafide Verified Property Booking', payerEmail } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    // Check auth from Supabase SSR
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const externalId = `KF-INV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    const origin = new URL(request.url).origin

    const invoice = await createInvoice({
      externalId,
      amount: Number(amount),
      description: `${description} ${listingId ? `(#${listingId})` : ''}`,
      payerEmail: payerEmail || user?.email,
      currency: 'PHP',
      successRedirectUrl: `${origin}/payment/success?ref=${externalId}`,
      failureRedirectUrl: `${origin}/payment/failed?ref=${externalId}`,
    })

    return NextResponse.json({
      success: true,
      externalId,
      invoiceUrl: invoice.invoice_url,
      status: invoice.status,
      amount: invoice.amount,
    })
  } catch (error) {
    console.error('Error generating Xendit Invoice:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
