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
  hooks: {
    beforeChange: [
      // Update access lets either side touch the row; this decides WHAT each side may change.
      // Without it a buyer could mark their own payment "confirmed" or change the amount.
      ({ data, originalDoc, operation, req }) => {
        if (operation !== 'update' || !originalDoc || hasStaffReq(req)) return data
        const user = getReqUser(req)
        const me = String(user?.id ?? '')
        const idOf = (v: unknown) =>
          String(typeof v === 'object' && v !== null ? (v as { id: unknown }).id : v)
        const isPayee = idOf(originalDoc.payee) === me
        const isPayer = idOf(originalDoc.payer) === me
        const next = data?.status
        const allowed: Record<string, string[]> = {
          pending_verification: isPayee ? ['confirmed', 'rejected'] : [],
          confirmed: isPayer && originalDoc.paymentType === 'security_deposit' ? ['refund_requested'] : [],
          refund_requested: isPayee ? ['refunded'] : [],
        }
        if (next && next !== originalDoc.status && !(allowed[originalDoc.status] ?? []).includes(next)) {
          throw new Error('You cannot change this payment to that status.')
        }
        // Everything else stays as it was recorded.
        return { ...originalDoc, status: next ?? originalDoc.status }
      },
    ],
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
            { label: 'E-Wallet (other)', value: 'ewallet' },
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
    {
      // The in-chat payment request this payment answers, so the card in Messages can show
      // "Paid" / "Waiting for confirmation" instead of offering Pay now again.
      name: 'requestMessage',
      type: 'relationship',
      relationTo: 'messages',
      index: true,
    },
    // Which e-wallet or bank the money went to, e.g. "ShopeePay" or "BDO".
    { name: 'methodLabel', type: 'text' },
    // Reference number the buyer typed from their e-wallet or bank receipt.
    { name: 'payerReference', type: 'text' },
    // Private storage path of the receipt screenshot (kind 'payment-proof').
    { name: 'proofPath', type: 'text' },
  ],
  timestamps: true,
}
