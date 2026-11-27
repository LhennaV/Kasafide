'use server'

/**
 * Server actions for: seller payment accounts, in-chat payment requests and paying them,
 * the live-agent support chat, the first-time guide, and upgrading a buyer to a seller.
 *
 * Every amount a buyer pays is read from the seller's request message on the server, never from
 * the browser; the Messages collection refuses member edits to anything but `read`.
 */

import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { ownsPath } from '@/lib/storage'
import { MOBILE_EWALLETS } from '@/lib/payout-options'
import type { ActionResult } from './kasafide'

const STAFF = ['admin', 'superadmin', 'super_duper_admin']
/** Document IDs are numbers in this database (see payload-types.ts); ids from the browser are strings. */
const asId = (v: unknown) => Number(typeof v === 'object' && v !== null ? (v as { id: unknown }).id : v)
const isStaff = (role?: string | null) => Boolean(role && STAFF.includes(role))
const idOf = (v: unknown) =>
  String(typeof v === 'object' && v !== null ? (v as { id: unknown }).id : v)

type PayType = 'rent' | 'reservation' | 'security_deposit' | 'purchase'
type PayMethod = 'ewallet' | 'bank_transfer'
const PAY_TYPES: PayType[] = ['rent', 'reservation', 'security_deposit', 'purchase']
const PAY_TYPE_LABEL: Record<PayType, string> = {
  rent: 'Monthly Rent',
  reservation: 'Reservation Fee',
  security_deposit: 'Security Deposit',
  purchase: 'Property Purchase',
}

async function notify(
  recipient: string | number,
  title: string,
  body: string,
  type: 'listing' | 'message' | 'payment' | 'system',
  link: string,
) {
  const payload = await getPayloadClient()
  await payload
    .create({
      collection: 'notifications',
      overrideAccess: true,
      data: { recipient: asId(recipient), title, body, type, link, unread: true },
    })
    .catch((err) => console.warn('[notify] failed:', err))
}

function folderFor(role?: string | null) {
  return role === 'seller' ? 'seller' : role === 'admin' ? 'admin' : isStaff(role) ? 'super-admin' : 'buyer'
}

// ── Seller payment accounts ─────────────────────────────────────────────────

/** "0917 123 4567", "+63 917…", "917…" → "09171234567"; '' when blank; null when not a PH mobile. */
function normalizeMobile(raw: string): string | null {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return ''
  const local = digits.startsWith('63') ? `0${digits.slice(2)}` : digits.startsWith('9') ? `0${digits}` : digits
  return /^09\d{9}$/.test(local) ? local : null
}

export async function savePayoutAccountsAction(input: {
  ewalletProvider: string
  ewalletNumber: string
  ewalletName: string
  bankName: string
  bankAccountNumber: string
  bankAccountName: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user || user.role !== 'seller') return { ok: false, error: 'Only sellers can set payment accounts.' }

  const clean = (v: string, max = 80) => String(v || '').trim().slice(0, max)
  const provider = clean(input.ewalletProvider, 40)
  let ewalletNumber = clean(input.ewalletNumber, 40)
  const ewalletName = clean(input.ewalletName)
  if (provider) {
    if (MOBILE_EWALLETS.includes(provider)) {
      const mobile = normalizeMobile(ewalletNumber)
      if (!mobile) return { ok: false, error: `Enter your ${provider} number, e.g. 0917 123 4567.` }
      ewalletNumber = mobile
    } else if (ewalletNumber.replace(/W/g, '').length < 4) {
      return { ok: false, error: `Enter your ${provider} number or account ID.` }
    }
    if (!ewalletName) return { ok: false, error: `Add the account name on your ${provider}.` }
  }

  const bank = {
    bankName: clean(input.bankName, 60),
    bankAccountNumber: clean(input.bankAccountNumber, 40).replace(/[^0-9 -]/g, ''),
    bankAccountName: clean(input.bankAccountName),
  }
  const bankParts = Object.values(bank).filter(Boolean).length
  if (bankParts > 0 && bankParts < 3) {
    return { ok: false, error: 'For bank transfer, choose the bank and fill in the account number and account name.' }
  }
  if (!provider && bankParts === 0) {
    return { ok: false, error: 'Turn on at least one way to receive payments.' }
  }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'users',
    id: user.id,
    user,
    overrideAccess: false,
    data: {
      ewalletProvider: provider,
      ewalletNumber: provider ? ewalletNumber : '',
      ewalletName: provider ? ewalletName : '',
      ...bank,
    },
  })
  return { ok: true, message: 'Payout settings saved. Buyers will see them when they pay your requests.' }
}

// ── In-chat payment request (seller → buyer) ─────────────────────────────────

export async function requestPaymentAction(input: {
  recipientId: string
  listingId: string
  amount: number
  paymentType: PayType
  periodLabel?: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user || user.role !== 'seller') return { ok: false, error: 'Only sellers can request payments.' }

  const amount = Math.round(Number(input.amount) * 100) / 100
  if (!(amount >= 1) || amount > 100_000_000) return { ok: false, error: 'Enter a valid amount.' }
  if (!PAY_TYPES.includes(input.paymentType)) return { ok: false, error: 'Choose what the payment is for.' }
  if (!input.listingId) {
    return { ok: false, error: 'This conversation is not linked to one of your listings.' }
  }
  if (String(input.recipientId) === String(user.id)) return { ok: false, error: 'You cannot bill yourself.' }

  if (!user.ewalletNumber && !user.bankAccountNumber) {
    return {
      ok: false,
      error: 'Add your e-wallet or bank account in Payments → Payout Settings first, so the buyer knows where to pay.',
    }
  }

  const payload = await getPayloadClient()
  const listing = await payload
    .findByID({ collection: 'listings', id: input.listingId, overrideAccess: true, depth: 0 })
    .catch(() => null)
  if (!listing || idOf(listing.seller) !== String(user.id)) {
    return { ok: false, error: 'You can only request payment for your own listing.' }
  }

  const period = String(input.periodLabel || '').trim().slice(0, 60)
  await payload.create({
    collection: 'messages',
    user,
    overrideAccess: false,
    data: {
      sender: user.id,
      recipient: asId(input.recipientId),
      listing: listing.id,
      messageType: 'payment_request',
      requestedAmount: amount,
      requestedPaymentType: input.paymentType,
      requestedPeriodLabel: period,
      body: `Payment request: ${PAY_TYPE_LABEL[input.paymentType]}${period ? ` (${period})` : ''} for ${listing.title}.`,
      read: false,
    },
  })

  await notify(
    input.recipientId,
    'New payment request',
    `${user.fullName} sent a ${PAY_TYPE_LABEL[input.paymentType].toLowerCase()} request of ₱${amount.toLocaleString('en-PH')} for ${listing.title}.`,
    'payment',
    `/module/buyer/messages?thread=${user.id}`,
  )

  return { ok: true, message: 'Payment request sent to the chat.' }
}

// ── Paying a request (buyer) ─────────────────────────────────────────────────

export async function payRequestAction(input: {
  messageId: string
  method: PayMethod
  reference: string
  proofPath?: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to pay.' }

  const reference = String(input.reference || '').trim().replace(/\s+/g, '').slice(0, 40)
  if (reference.length < 4) {
    return { ok: false, error: 'Enter the reference number from your e-wallet or bank receipt.' }
  }
  if (!['ewallet', 'bank_transfer'].includes(input.method)) {
    return { ok: false, error: 'Choose E-Wallet or Bank Transfer.' }
  }
  if (input.proofPath && !ownsPath(String(user.id), 'payment-proof', input.proofPath)) {
    return { ok: false, error: 'Please attach the receipt again.' }
  }

  const payload = await getPayloadClient()
  const msg = await payload
    .findByID({ collection: 'messages', id: input.messageId, overrideAccess: true, depth: 0 })
    .catch(() => null)
  if (!msg || msg.messageType !== 'payment_request' || idOf(msg.recipient) !== String(user.id)) {
    return { ok: false, error: 'This payment request was not sent to you.' }
  }
  if (!msg.requestedAmount || !msg.listing) return { ok: false, error: 'This request has no amount.' }

  const existing = await payload.find({
    collection: 'payments',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: {
      and: [
        { requestMessage: { equals: msg.id } },
        { status: { in: ['pending_verification', 'confirmed', 'refund_requested', 'refunded'] } },
      ],
    },
  })
  if (existing.docs.length > 0) {
    return { ok: false, error: 'You already paid this request. Wait for the seller to confirm it.' }
  }

  const seller = await payload.findByID({
    collection: 'users',
    id: idOf(msg.sender),
    overrideAccess: true,
    depth: 0,
  })
  const isBank = input.method === 'bank_transfer'
  const hasMethod = isBank ? Boolean(seller.bankAccountNumber) : Boolean(seller.ewalletNumber)
  if (!hasMethod) return { ok: false, error: 'The seller does not accept that payment method.' }

  // Stored method keeps GCash/Maya apart for the analytics; any other wallet is 'ewallet'.
  const methodLabel = (isBank ? seller.bankName : seller.ewalletProvider) || (isBank ? 'Bank' : 'E-Wallet')
  const method = isBank
    ? 'bank_transfer'
    : methodLabel === 'GCash'
      ? 'gcash'
      : methodLabel === 'Maya'
        ? 'maya'
        : 'ewallet'
  const prefix = isBank ? 'BK' : method === 'gcash' ? 'GC' : method === 'maya' ? 'MY' : 'EW'
  const referenceCode = `KF-${prefix}-${Date.now().toString(36).toUpperCase()}`

  await payload.create({
    collection: 'payments',
    user,
    overrideAccess: false,
    data: {
      referenceCode,
      listing: asId(msg.listing),
      payer: user.id,
      payee: seller.id,
      paymentType: (msg.requestedPaymentType as PayType) || 'rent',
      method,
      methodLabel,
      amount: msg.requestedAmount,
      periodLabel: msg.requestedPeriodLabel || 'Current Period',
      status: 'pending_verification',
      requestMessage: msg.id,
      payerReference: reference,
      proofPath: input.proofPath || undefined,
    },
  })

  await notify(
    seller.id,
    'Payment received — please confirm',
    `${user.fullName} paid ₱${Number(msg.requestedAmount).toLocaleString('en-PH')} via ${isBank ? `bank transfer (${methodLabel})` : methodLabel} (ref ${reference}). Check your account, then confirm it in Payments.`,
    'payment',
    '/module/seller/payments',
  )

  return { ok: true, message: 'Payment sent! The seller will confirm once it reaches their account.' }
}

// ── Live agent (member ↔ admins) ─────────────────────────────────────────────

/** A member writes to Kasafide support. Any admin can answer from Admin → Live Support. */
export async function contactSupportAction(input: { body: string }): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in so an admin can reply to you.' }
  if (isStaff(user.role)) return { ok: false, error: 'Admins answer support chats from Live Support.' }

  const body = String(input.body || '').trim().slice(0, 2000)
  if (!body) return { ok: false, error: 'Type your question first.' }

  const payload = await getPayloadClient()
  // `recipient` is required on a message; the chat itself is shared by every admin (the admin
  // inbox groups support messages by member, not by which admin they were addressed to).
  const admins = await payload.find({
    collection: 'users',
    overrideAccess: true,
    depth: 0,
    limit: 20,
    sort: 'createdAt',
    where: { role: { in: STAFF } },
  })
  const first = admins.docs.find((a) => a.role === 'admin') ?? admins.docs[0]
  if (!first) return { ok: false, error: 'No admin is set up yet. Please email kasafide.team@gmail.com.' }

  await payload.create({
    collection: 'messages',
    user,
    overrideAccess: false,
    data: { sender: user.id, recipient: first.id, messageType: 'support', body, read: false },
  })

  for (const a of admins.docs) {
    await notify(
      a.id,
      'Live agent request',
      `${user.fullName}: ${body.slice(0, 120)}`,
      'message',
      a.role === 'admin' ? '/module/admin/support' : '/module/super-admin/support',
    )
  }

  return {
    ok: true,
    message: 'Sent to a Kasafide admin. Their reply will appear in your Messages.',
    slug: `/module/${folderFor(user.role)}/messages?thread=support`,
  }
}

export async function replySupportAction(input: { memberId: string; body: string }): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user || !isStaff(user.role)) return { ok: false, error: 'Admin privileges required.' }
  const body = String(input.body || '').trim().slice(0, 2000)
  if (!body) return { ok: false, error: 'Message cannot be empty.' }

  const payload = await getPayloadClient()
  const member = await payload
    .findByID({ collection: 'users', id: input.memberId, overrideAccess: true, depth: 0 })
    .catch(() => null)
  if (!member) return { ok: false, error: 'That member no longer exists.' }

  await payload.create({
    collection: 'messages',
    user,
    overrideAccess: false,
    data: { sender: user.id, recipient: member.id, messageType: 'support', body, read: false },
  })
  await notify(
    member.id,
    'Kasafide Support replied',
    body.slice(0, 140),
    'message',
    `/module/${folderFor(member.role)}/messages?thread=support`,
  )
  return { ok: true, message: 'Reply sent.' }
}

// ── First-time guide ─────────────────────────────────────────────────────────

export async function completeOnboardingAction(): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }
  const payload = await getPayloadClient()
  await payload.update({
    collection: 'users',
    id: user.id,
    user,
    overrideAccess: false,
    data: { onboardingCompletedAt: new Date().toISOString() },
  })
  return { ok: true }
}

// ── Buyer → Seller upgrade ───────────────────────────────────────────────────

export async function upgradeToSellerAction(input: { signatureName: string; agreed: boolean }): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in first.' }
  if (user.role !== 'buyer') return { ok: false, error: 'Only buyer accounts can be upgraded.' }
  if (user.accountStatus === 'suspended') return { ok: false, error: 'Suspended accounts cannot be upgraded.' }
  if (!input.agreed) return { ok: false, error: 'Please agree to the Memorandum of Agreement.' }
  const name = String(input.signatureName || '').trim()
  if (name.length < 3) return { ok: false, error: 'Type your full legal name to sign the MOA.' }

  const payload = await getPayloadClient()
  // `role` is staff-only at field level, so the change itself is made with overrideAccess after
  // the checks above. Verification status, saved listings, messages and payments are kept.
  await payload.update({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
    data: {
      role: 'seller',
      moaSignatureName: name,
      moaSignedAt: new Date().toISOString(),
      onboardingCompletedAt: null,
    },
  })
  await payload
    .create({
      collection: 'audit-logs',
      overrideAccess: true,
      data: {
        actorName: user.fullName,
        actorEmail: user.email,
        actorRole: 'buyer',
        action: 'Upgraded account: Buyer → Seller',
        status: 'success',
        details: `MOA signed as "${name}"`,
      },
    })
    .catch(() => null)
  await notify(
    user.id,
    'Welcome to selling on Kasafide',
    'Your account is now a Seller account. Add your payment accounts, then post your first property for admin review.',
    'system',
    '/module/seller',
  )
  return { ok: true, message: 'Your account is now a Seller account!', slug: '/module/seller' }
}
