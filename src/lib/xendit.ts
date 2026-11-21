/**
 * Xendit Payment Integration Utilities
 * Documentation: https://developers.xendit.co/api-reference/
 */

const XENDIT_BASE_URL = 'https://api.xendit.co'

function getAuthHeader(): string {
  const secretKey = process.env.XENDIT_SECRET_KEY || ''
  const encoded = Buffer.from(`${secretKey}:`).toString('base64')
  return `Basic ${encoded}`
}

export type CreateQrCodeParams = {
  referenceId: string
  amount: number
  currency?: string
  type?: 'DYNAMIC' | 'STATIC'
  expiresAt?: string
}

export type QrCodeResponse = {
  id: string
  external_id?: string
  reference_id: string
  type: string
  currency: string
  amount: number
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  qr_string: string
  created: string
  updated: string
}

export type CreateInvoiceParams = {
  externalId: string
  amount: number
  description: string
  payerEmail?: string
  currency?: string
  successRedirectUrl?: string
  failureRedirectUrl?: string
}

export type InvoiceResponse = {
  id: string
  external_id: string
  status: 'PENDING' | 'PAID' | 'EXPIRED'
  merchant_name: string
  amount: number
  payer_email?: string
  description: string
  invoice_url: string
  expiry_date: string
}

/**
 * Create a dynamic QR Ph code via Xendit
 */
export async function createQrCode(params: CreateQrCodeParams): Promise<QrCodeResponse> {
  const res = await fetch(`${XENDIT_BASE_URL}/qr_codes`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
      'api-version': '2022-07-31',
    },
    body: JSON.stringify({
      reference_id: params.referenceId,
      type: params.type || 'DYNAMIC',
      currency: params.currency || 'PHP',
      amount: params.amount,
      expires_at: params.expiresAt,
    }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(
      errorData.message || `Xendit QR creation failed with status ${res.status}`
    )
  }

  return res.json()
}

/**
 * Create an invoice for E-Wallets (GCash, Maya), cards, and bank transfers
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse> {
  const res = await fetch(`${XENDIT_BASE_URL}/v2/invoices`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      description: params.description,
      currency: params.currency || 'PHP',
      payer_email: params.payerEmail,
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
    }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(
      errorData.message || `Xendit Invoice creation failed with status ${res.status}`
    )
  }

  return res.json()
}

/**
 * Verify incoming webhook token from Xendit
 */
export function verifyWebhookToken(headerToken: string | null): boolean {
  const configuredToken = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN
  if (!configuredToken) {
    console.warn('XENDIT_WEBHOOK_VERIFICATION_TOKEN is not configured.')
    return false
  }
  return headerToken === configuredToken
}
