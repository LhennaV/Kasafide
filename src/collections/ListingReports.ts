import type { CollectionConfig, Where } from 'payload'
import { getReqUser, hasStaffReq, isAppStaff, isAppStaffField, isAppUser } from '../access/kasafideAccess'

export const ListingReports: CollectionConfig = {
  slug: 'listing-reports',
  admin: {
    useAsTitle: 'reason',
    group: 'Kasafide Trust & Safety',
    defaultColumns: ['listing', 'reporter', 'reason', 'status', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id) {
        return { reporter: { equals: user.id } } satisfies Where
      }
      return false
    },
    create: isAppUser,
    update: isAppStaff,
    delete: isAppStaff,
  },
  fields: [
    { name: 'listing', type: 'relationship', relationTo: 'listings', required: true, index: true },
    { name: 'reporter', type: 'relationship', relationTo: 'users', required: true, index: true },
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: [
        { label: 'Suspected Fake / Non-Existent Property', value: 'fake_listing' },
        { label: 'Misleading Photos or Address', value: 'misleading_photos' },
        { label: 'Inaccurate Price / Hidden Charges', value: 'wrong_price' },
        { label: 'Off-Platform Scam Attempt', value: 'scam_behavior' },
        { label: 'Duplicate / Outdated Listing', value: 'duplicate' },
      ],
    },
    { name: 'details', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Investigating', value: 'investigating' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Dismissed', value: 'dismissed' },
      ],
      access: { update: isAppStaffField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'resolutionNotes',
      type: 'textarea',
      access: { update: isAppStaffField },
    },
  ],
  timestamps: true,
}
