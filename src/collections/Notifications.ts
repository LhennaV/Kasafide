import type { CollectionConfig, Where } from 'payload'
import { getReqUser, hasStaffReq, isAppStaff, isAppUser } from '../access/kasafideAccess'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    group: 'Kasafide Operations',
    defaultColumns: ['recipient', 'title', 'type', 'unread', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id) {
        return { recipient: { equals: user.id } } satisfies Where
      }
      return false
    },
    create: isAppUser,
    update: ({ req }) => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id) {
        return { recipient: { equals: user.id } } satisfies Where
      }
      return false
    },
    delete: isAppStaff,
  },
  fields: [
    { name: 'recipient', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'system',
      options: [
        { label: 'Listing Update', value: 'listing' },
        { label: 'Message', value: 'message' },
        { label: 'Payment', value: 'payment' },
        { label: 'System / Verification', value: 'system' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'link', type: 'text' },
    { name: 'unread', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}
