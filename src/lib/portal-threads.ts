import 'server-only'
import { getPayloadClient } from '@/lib/payload'
import type { Listing, Message, User } from '@/payload-types'
import type { ThreadView } from '@/components/kasafide/MessengerWorkspace'

export async function buildThreadsForUser(rawUser: User): Promise<ThreadView[]> {
  const payload = await getPayloadClient()
  const msgsRes = await payload.find({
    collection: 'messages',
    user: rawUser,
    overrideAccess: false,
    depth: 1,
    limit: 100,
    sort: 'createdAt',
  })

  const map = new Map<string, ThreadView>()
  const myId = String(rawUser.id)

  for (const m of msgsRes.docs as Message[]) {
    const senderObj = typeof m.sender === 'object' && m.sender ? (m.sender as User) : null
    const recipientObj =
      typeof m.recipient === 'object' && m.recipient ? (m.recipient as User) : null
    const listingObj =
      typeof m.listing === 'object' && m.listing ? (m.listing as Listing) : null

    const senderId = senderObj ? String(senderObj.id) : String(m.sender)
    const fromMe = senderId === myId
    const partner = fromMe ? recipientObj : senderObj
    const partnerId = partner
      ? String(partner.id)
      : fromMe
        ? String(m.recipient)
        : senderId

    if (!map.has(partnerId)) {
      map.set(partnerId, {
        partnerId,
        partnerName: partner?.fullName || 'Verified Kasafide User',
        partnerRole: partner?.role || 'member',
        listingId: listingObj ? String(listingObj.id) : undefined,
        listingTitle: listingObj?.title,
        messages: [],
      })
    }

    const thread = map.get(partnerId)!
    if (listingObj && !thread.listingTitle) {
      thread.listingId = String(listingObj.id)
      thread.listingTitle = listingObj.title
    }

    thread.messages.push({
      id: String(m.id),
      fromMe,
      body: m.body,
      messageType: m.messageType,
      requestedAmount: m.requestedAmount,
      createdAt: m.createdAt,
    })
  }

  return Array.from(map.values())
}
