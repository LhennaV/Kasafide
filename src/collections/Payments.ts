import type { AccessResult, CollectionConfig } from 'payload'
import { getReqUser, hasStaffReq, isAppStaff, isAppUser } from '../access/kasafideAccess'

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'referenceCode',
    group: 'Kasafide Operations',
    defaultColumns: ['referenceCode', 'listing', 'payer', 'amount', 'method', 'status'],
  },
  access: {
    read: ({ req }): AccessResult => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id) {
        return {
          or: [{ payer: { equals: user.id } }, { payee: { equals: user.id } }],
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
          or: [{ payer: { equals: user.id } }, { payee: { equals: user.id } }],
        }
      }
      return false
    },
    delete: isAppStaff,
  },
  fields: [
    { name: 'referenceCode', type: 'text', required: true, unique: true, index: true },
    { name: 'listing', type: 'relationship', relationTo: 'listings', required: true, index: true },
    { name: 'payer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'payee', type: 'relationship', relationTo: 'users', required: true, index: true },
    {
      type: 'row',
      fields: [
        {
          name: 'paymentType',
          type: 'select',
          required: true,
          options: [
            { label: 'Monthly Rent', value: 'rent' },
            { label: 'Reservation Fee', value: 'reservation' },
            { label: 'Security Deposit', value: 'security_deposit' },
            { label: 'Property Purchase', value: 'purchase' },
          ],
        },
        {
          name: 'method',
          type: 'select',
          required: true,
          options: [
            { label: 'QR Ph (Xendit)', value: 'qrph' },
            { label: 'GCash', value: 'gcash' },
            { label: 'Maya', value: 'maya' },
            { label: 'Bank Transfer', value: 'bank_transfer' },
          ],
        },
        { name: 'amount', type: 'number', required: true, min: 1 },
      ],
    },
    { name: 'periodLabel', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending_verification',
      index: true,
      options: [
        { label: 'Pending Seller Confirmation', value: 'pending_verification' },
        { label: 'Confirmed / Paid', value: 'confirmed' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Refund Requested', value: 'refund_requested' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'notes', type: 'textarea' },
  ],
  timestamps: true,
}
