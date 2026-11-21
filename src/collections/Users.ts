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
  auth: true,
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
