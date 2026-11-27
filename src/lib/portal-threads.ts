import 'server-only'
import { getPayloadClient } from '@/lib/payload'
import type { Listing, Message, Payment, User } from '@/payload-types'
import type { PayToAccounts, ThreadView } from '@/components/kasafide/MessengerWorkspace'

/** Thread id used for the member ↔ Kasafide admins live-agent chat. */
export const SUPPORT_THREAD_ID = 'support'

const STAFF = ['admin', 'superadmin', 'super_duper_admin']
const idOf = (v: unknown) =>
  String(typeof v === 'object' && v !== null ? (v as { id: unknown }).id : v)

function payToOf(u: User | null): PayToAccounts {
  if (!u) return {}
  return {
    ewallet: u.ewalletNumber
      ? { provider: u.ewalletProvider || 'E-Wallet', number: u.ewalletNumber, name: u.ewalletName || u.fullName }
      : undefined,
    bank: u.bankAccountNumber
      ? { bank: u.bankName || 'Bank', number: u.bankAccountNumber, name: u.bankAccountName || u.fullName }
      : undefined,
  }
}

/** Latest status of the payment made against each request message. */
async function paymentStatusByRequest(messageIds: string[]) {
  const map = new Map<string, Payment['status']>()
  if (messageIds.length === 0) return map
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'payments',
    overrideAccess: true,
    depth: 0,
    limit: 500,
    sort: 'createdAt',
    where: { requestMessage: { in: messageIds } },
  })
  for (const p of res.docs as Payment[]) {
    if (p.requestMessage) map.set(idOf(p.requestMessage), p.status)
  }
  return map
}

export async function buildThreadsForUser(rawUser: User): Promise<ThreadView[]> {
  const payload = await getPayloadClient()
  const myId = String(rawUser.id)
  // Staff can read every message in the system; their own inbox is only what involves them.
  const msgsRes = await payload.find({
    collection: 'messages',
    user: rawUser,
    overrideAccess: false,
    depth: 1,
    limit: 300,
    sort: '-createdAt',
    where: STAFF.includes(rawUser.role)
      ? { or: [{ sender: { equals: myId } }, { recipient: { equals: myId } }] }
      : undefined,
  })
  // Newest 300, shown oldest → newest.
  const docs = (msgsRes.docs as Message[]).slice().reverse()

  const statusByRequest = await paymentStatusByRequest(
    docs.filter((m) => m.messageType === 'payment_request').map((m) => String(m.id)),
  )

  const map = new Map<string, ThreadView>()

  for (const m of docs) {
    const senderObj = typeof m.sender === 'object' && m.sender ? (m.sender as User) : null
    const recipientObj = typeof m.recipient === 'object' && m.recipient ? (m.recipient as User) : null
    const listingObj = typeof m.listing === 'object' && m.listing ? (m.listing as Listing) : null

    const senderId = idOf(m.sender)
    const fromMe = senderId === myId
    const partner = fromMe ? recipientObj : senderObj
    const isSupport = m.messageType === 'support' && !STAFF.includes(rawUser.role)
    const partnerId = isSupport ? SUPPORT_THREAD_ID : fromMe ? idOf(m.recipient) : senderId

    if (!map.has(partnerId)) {
      map.set(partnerId, {
        partnerId,
        partnerName: isSupport ? 'Kasafide Support · Live Agent' : partner?.fullName || 'Verified Kasafide User',
        partnerRole: isSupport ? 'admin' : partner?.role || 'member',
        listingId: undefined,
        listingTitle: undefined,
        messages: [],
      })
    }

    const thread = map.get(partnerId)!
    if (listingObj && !isSupport) {
      // The thread is about the listing mentioned most recently.
      thread.listingId = String(listingObj.id)
      thread.listingTitle = listingObj.title
    }

    const isRequest = m.messageType === 'payment_request'
    thread.messages.push({
      id: String(m.id),
      fromMe,
      senderName: isSupport && !fromMe ? senderObj?.fullName || 'Kasafide Admin' : undefined,
      body: m.body,
      messageType: m.messageType,
      requestedAmount: m.requestedAmount,
      requestedPaymentType: m.requestedPaymentType || null,
      requestedPeriodLabel: m.requestedPeriodLabel || '',
      listingTitle: listingObj?.title,
      paymentStatus: isRequest ? statusByRequest.get(String(m.id)) || 'unpaid' : undefined,
      // Only the person asked to pay gets the seller's account details.
      payTo: isRequest && !fromMe ? payToOf(senderObj) : undefined,
      createdAt: m.createdAt,
    })
  }

  // Most recent conversation first; the support chat always exists for members so the live agent
  // is one tap away.
  const threads = Array.from(map.values()).sort((a, b) =>
    (b.messages.at(-1)?.createdAt || '').localeCompare(a.messages.at(-1)?.createdAt || ''),
  )
  return threads
}

/** Admin inbox: every support message, grouped by the member who opened the chat. */
export async function buildSupportThreadsForAdmin(rawUser: User): Promise<ThreadView[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'messages',
    user: rawUser,
    overrideAccess: false,
    depth: 1,
    limit: 500,
    sort: '-createdAt',
    where: { messageType: { equals: 'support' } },
  })
  const docs = (res.docs as Message[]).slice().reverse()
  const map = new Map<string, ThreadView>()

  for (const m of docs) {
    const sender = typeof m.sender === 'object' && m.sender ? (m.sender as User) : null
    const recipient = typeof m.recipient === 'object' && m.recipient ? (m.recipient as User) : null
    const senderIsStaff = sender ? STAFF.includes(sender.role) : false
    const member = senderIsStaff ? recipient : sender
    const memberId = senderIsStaff ? idOf(m.recipient) : idOf(m.sender)

    if (!map.has(memberId)) {
      map.set(memberId, {
        partnerId: memberId,
        partnerName: member?.fullName || 'Kasafide member',
        partnerRole: member?.role || 'member',
        messages: [],
      })
    }
    map.get(memberId)!.messages.push({
      id: String(m.id),
      fromMe: senderIsStaff,
      senderName: senderIsStaff ? sender?.fullName || 'Admin' : undefined,
      body: m.body,
      messageType: m.messageType,
      createdAt: m.createdAt,
    })
  }

  return Array.from(map.values()).sort((a, b) =>
    (b.messages.at(-1)?.createdAt || '').localeCompare(a.messages.at(-1)?.createdAt || ''),
  )
}
