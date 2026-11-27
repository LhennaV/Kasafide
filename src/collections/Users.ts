import type { AccessResult, CollectionConfig } from 'payload'
import {
  getReqUser,
  hasStaffReq,
  isAppStaffField,
  isAppSuperAdmin,
  isSelfOrStaffField,
} from '../access/kasafideAccess'
import { invalidateListingCaches } from '../hooks/revalidateKasafide'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // The signed-in user is read on every page load. At Payload's default depth (2) that also
    // loaded every saved listing with its seller, barangay and photos; nothing uses those
    // (saved listings are only needed as IDs), so keep relations unpopulated.
    depth: 0,
    forgotPassword: {
      // Payload's default link opens /admin/reset/<token> (the CMS panel). Members reset theirs on
      // the Kasafide page instead. The mail itself still needs an email adapter in payload.config.ts.
      generateEmailSubject: () => 'Reset your Kasafide password',
      generateEmailHTML: ({ req, token } = {}) => {
        const host = req?.headers?.get('host')
        const origin =
          process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
          (host ? `${host.startsWith('localhost') ? 'http' : 'https'}://${host}` : 'http://localhost:3000')
        const link = `${origin}/auth/reset-password?token=${encodeURIComponent(token ?? '')}`
        return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#2B1B3D;line-height:1.5">
<h2 style="margin:0 0 12px">Reset your Kasafide password</h2>
<p>Someone asked to reset the password for this Kasafide account. If it was you, open the link below. It works for one hour.</p>
<p><a href="${link}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#5B3A8E;color:#FBF6F0;text-decoration:none;font-weight:bold">Choose a new password</a></p>
<p style="font-size:13px;color:#6b5b7b">Or paste this into your browser: ${link}</p>
<p style="font-size:13px;color:#6b5b7b">If you didn't ask for this, you can ignore this email. Your password stays the same.</p>
</body></html>`
      },
    },
  },
  admin: {
    useAsTitle: 'fullName',
    group: 'Kasafide Directory',
    defaultColumns: ['fullName', 'email', 'role', 'accountStatus', 'createdAt'],
  },
  access: {
    create: () => true,
    read: ({ req }): AccessResult => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id) {
        return {
          or: [
            { id: { equals: user.id } },
            { role: { in: ['seller', 'buyer'] } },
          ],
        }
      }
      // Public routes can resolve verified seller display names on approved listings
      return {
        role: { equals: 'seller' },
      }
    },
    update: ({ req }): AccessResult => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id) {
        return { id: { equals: user.id } }
      }
      return false
    },
    delete: isAppSuperAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data
        const first = (data.firstName ?? originalDoc?.firstName ?? '').trim()
        const mi = (data.middleInitial ?? originalDoc?.middleInitial ?? '').trim()
        const last = (data.lastName ?? originalDoc?.lastName ?? '').trim()
        const composed = [first, mi ? `${mi.replace(/\.$/, '')}.` : '', last]
          .filter(Boolean)
          .join(' ')
          .trim()
        if (composed) {
          data.fullName = composed
        } else if (!data.fullName && data.email) {
          data.fullName = String(data.email).split('@')[0]
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, req, operation }) => {
        if (!data) return data
        // Prevent unprivileged self-signup from escalating role or verification state
        const staff = hasStaffReq(req)
        const isUntrustedPublicWrite =
          Boolean(req.context?.isPublicSelfSignup) ||
          (!staff && (req.payloadAPI === 'REST' || req.payloadAPI === 'GraphQL'))
        if (operation === 'create' && isUntrustedPublicWrite) {
          if (data.role !== 'seller') {
            data.role = 'buyer'
          }
          data.accountStatus = 'unverified'
          data.warningCount = 0
        }
        return data
      },
    ],
    afterChange: [
      ({ doc, previousDoc, context }) => {
        if (context?.skipRevalidate) return doc
        if (
          previousDoc &&
          (doc.accountStatus !== previousDoc.accountStatus || doc.fullName !== previousDoc.fullName)
        ) {
          invalidateListingCaches([])
        }
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'middleInitial', type: 'text' },
        { name: 'lastName', type: 'text', required: true },
      ],
    },
    {
      name: 'fullName',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'buyer',
      saveToJWT: true,
      index: true,
      options: [
        { label: 'Buyer / Renter', value: 'buyer' },
        { label: 'Seller / Lister', value: 'seller' },
        { label: 'Admin', value: 'admin' },
        { label: 'Super Admin', value: 'superadmin' },
        { label: 'Super Duper Admin', value: 'super_duper_admin' },
      ],
      access: {
        update: isAppStaffField,
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'accountStatus',
      type: 'select',
      required: true,
      defaultValue: 'unverified',
      index: true,
      options: [
        { label: 'Unverified', value: 'unverified' },
        { label: 'Pending Review', value: 'pending' },
        { label: 'Verified', value: 'verified' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Suspended', value: 'suspended' },
      ],
      access: {
        update: isAppStaffField,
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'phone',
      type: 'text',
      access: {
        read: isSelfOrStaffField,
      },
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'avatarUrl',
      type: 'text',
    },
    {
      name: 'authProvider',
      type: 'select',
      defaultValue: 'local',
      options: [
        { label: 'Email & Password', value: 'local' },
        { label: 'Google OAuth', value: 'google' },
      ],
      access: {
        read: isSelfOrStaffField,
        update: isAppStaffField,
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'providerId',
      type: 'text',
      unique: true,
      index: true,
      access: {
        read: isSelfOrStaffField,
        update: isAppStaffField,
      },
    },
    {
      name: 'verifiedAt',
      type: 'date',
      access: { update: isAppStaffField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'verificationExpiry',
      type: 'date',
      access: { update: isAppStaffField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'moaSignedAt',
      type: 'date',
      access: { read: isSelfOrStaffField },
    },
    {
      name: 'moaSignatureName',
      type: 'text',
      access: { read: isSelfOrStaffField },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'gcashNumber',
          type: 'text',
          access: {
            read: ({ req }) => Boolean(req.user),
          },
        },
        {
          name: 'mayaNumber',
          type: 'text',
          access: {
            read: ({ req }) => Boolean(req.user),
          },
        },
      ],
    },
    // Where a seller receives money. Shown to a buyer only inside the "Pay now" window of a
    // payment request the seller sent them (see portal-threads.ts), never on a public page.
    {
      type: 'row',
      fields: [
        { name: 'gcashName', type: 'text', access: { read: ({ req }) => Boolean(req.user) } },
        { name: 'mayaName', type: 'text', access: { read: ({ req }) => Boolean(req.user) } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'bankName', type: 'text', access: { read: ({ req }) => Boolean(req.user) } },
        { name: 'bankAccountNumber', type: 'text', access: { read: ({ req }) => Boolean(req.user) } },
        { name: 'bankAccountName', type: 'text', access: { read: ({ req }) => Boolean(req.user) } },
      ],
    },
    // The seller's e-wallet: any provider (GCash, Maya, ShopeePay, GrabPay, Coins.ph or one they
    // type). gcashNumber/mayaNumber above are the older per-provider fields, copied into these by
    // the 20261127_132105_payout_choices migration and no longer written.
    {
      type: 'row',
      fields: [
        { name: 'ewalletProvider', type: 'text', access: { read: ({ req }) => Boolean(req.user) } },
        { name: 'ewalletNumber', type: 'text', access: { read: ({ req }) => Boolean(req.user) } },
        { name: 'ewalletName', type: 'text', access: { read: ({ req }) => Boolean(req.user) } },
      ],
    },
    {
      // Empty until the person finishes or skips the first-time guide; the portal shows the guide
      // while this is empty.
      name: 'onboardingCompletedAt',
      type: 'date',
      access: { read: isSelfOrStaffField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'warningCount',
      type: 'number',
      defaultValue: 0,
      access: { update: isAppStaffField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'savedListings',
      type: 'relationship',
      relationTo: 'listings',
      hasMany: true,
      access: {
        read: isSelfOrStaffField,
      },
    },
  ],
  timestamps: true,
}
