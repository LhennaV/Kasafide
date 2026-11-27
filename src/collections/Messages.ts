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
  hooks: {
    beforeChange: [
      // Members may only mark a message read. Without this the recipient of a payment request
      // could lower its amount before paying.
      ({ data, originalDoc, operation, req }) => {
        if (operation !== 'update' || !originalDoc || hasStaffReq(req)) return data
        return { ...originalDoc, read: data?.read ?? originalDoc.read }
      },
    ],
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
        // Live-agent chat between a member and Kasafide admins (opened from Meowrie).
        { label: 'Live Agent Support', value: 'support' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'requestedAmount', type: 'number', min: 0 },
    {
      // What a payment request is for; the buyer's payment copies it.
      name: 'requestedPaymentType',
      type: 'select',
      options: [
        { label: 'Monthly Rent', value: 'rent' },
        { label: 'Reservation Fee', value: 'reservation' },
        { label: 'Security Deposit', value: 'security_deposit' },
        { label: 'Property Purchase', value: 'purchase' },
      ],
    },
    { name: 'requestedPeriodLabel', type: 'text' },
    { name: 'read', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}
