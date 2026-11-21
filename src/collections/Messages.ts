import type { AccessResult, CollectionConfig } from 'payload'
import { getReqUser, hasStaffReq, isAppStaff, isAppUser } from '../access/kasafideAccess'

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'body',
    group: 'Kasafide Operations',
    defaultColumns: ['sender', 'recipient', 'listing', 'messageType', 'createdAt'],
  },
  access: {
    read: ({ req }): AccessResult => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id) {
        return {
          or: [{ sender: { equals: user.id } }, { recipient: { equals: user.id } }],
        }
      }
      return false
    },
    create: isAppUser,
    update: ({ req }): AccessResult => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id) {
        return {
          or: [{ sender: { equals: user.id } }, { recipient: { equals: user.id } }],
        }
      }
      return false
    },
    delete: isAppStaff,
  },
  fields: [
    { name: 'sender', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'recipient', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'listing', type: 'relationship', relationTo: 'listings', index: true },
    { name: 'body', type: 'textarea', required: true },
    {
      name: 'messageType',
      type: 'select',
      required: true,
      defaultValue: 'text',
      options: [
        { label: 'Text Message', value: 'text' },
        { label: 'Viewing Request', value: 'viewing_request' },
        { label: 'In-Chat Payment Request', value: 'payment_request' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'requestedAmount', type: 'number', min: 0 },
    { name: 'read', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}
