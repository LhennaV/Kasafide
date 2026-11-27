import type { CollectionConfig, Where } from 'payload'
import { getReqUser, hasStaffReq, isAppStaff, isAppStaffField, isAppUser } from '../access/kasafideAccess'

export const VerificationSubmissions: CollectionConfig = {
  slug: 'verification-submissions',
  admin: {
    useAsTitle: 'idType',
    group: 'Kasafide Trust & Safety',
    defaultColumns: ['user', 'idType', 'status', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id) {
        return { user: { equals: user.id } } satisfies Where
      }
      return false
    },
    create: isAppUser,
    update: isAppStaff,
    delete: isAppStaff,
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    {
      name: 'idType',
      type: 'select',
      required: true,
      options: [
        { label: "Driver's License", value: 'drivers_license' },
        { label: 'Philippine Passport', value: 'passport' },
        { label: 'PhilSys National ID', value: 'philid' },
        { label: 'UMID', value: 'umid' },
        { label: 'Postal ID', value: 'postal_id' },
      ],
    },
    { name: 'idNumberLast4', type: 'text' },
    { name: 'selfieCaptured', type: 'checkbox', defaultValue: true },
    // Supabase Storage paths in the private bucket; admins view them through signed links.
    { name: 'idImagePath', type: 'text', admin: { readOnly: true } },
    { name: 'selfieImagePath', type: 'text', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      access: { update: isAppStaffField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'reviewerNotes',
      type: 'textarea',
      access: { update: isAppStaffField },
    },
  ],
  timestamps: true,
}
