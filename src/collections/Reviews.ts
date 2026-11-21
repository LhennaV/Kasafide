import type { CollectionConfig, Where } from 'payload'
import { getReqUser, hasStaffReq, isAppStaff, isAppUser } from '../access/kasafideAccess'
import {
  revalidateReviewAfterChange,
  revalidateReviewAfterDelete,
} from '../hooks/revalidateKasafide'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'comment',
    group: 'Kasafide Marketplace',
    defaultColumns: ['listing', 'reviewer', 'rating', 'createdAt'],
  },
  access: {
    read: () => true,
    create: isAppUser,
    update: ({ req }) => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id) {
        return { reviewer: { equals: user.id } } satisfies Where
      }
      return false
    },
    delete: isAppStaff,
  },
  hooks: {
    afterChange: [revalidateReviewAfterChange],
    afterDelete: [revalidateReviewAfterDelete],
  },
  fields: [
    { name: 'listing', type: 'relationship', relationTo: 'listings', required: true, index: true },
    { name: 'reviewer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'seller', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
    { name: 'comment', type: 'textarea', required: true },
  ],
  timestamps: true,
}
