import type { AccessResult, CollectionConfig } from 'payload'
import { getReqUser, hasStaffReq, isAppStaff, isAppUser } from '../access/kasafideAccess'

export const ViewingRequests: CollectionConfig = {
  slug: 'viewing-requests',
  admin: {
    useAsTitle: 'preferredDate',
    group: 'Kasafide Operations',
    defaultColumns: ['listing', 'buyer', 'seller', 'preferredDate', 'status'],
  },
  access: {
    read: ({ req }): AccessResult => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id) {
        return {
          or: [{ buyer: { equals: user.id } }, { seller: { equals: user.id } }],
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
          or: [{ buyer: { equals: user.id } }, { seller: { equals: user.id } }],
        }
      }
      return false
    },
    delete: isAppStaff,
  },
  fields: [
    { name: 'listing', type: 'relationship', relationTo: 'listings', required: true, index: true },
    { name: 'buyer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'seller', type: 'relationship', relationTo: 'users', required: true, index: true },
    {
      type: 'row',
      fields: [
        { name: 'preferredDate', type: 'text', required: true },
        { name: 'preferredTime', type: 'text', required: true },
      ],
    },
    { name: 'notes', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Declined', value: 'declined' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
