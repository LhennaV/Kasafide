import type { AccessResult, CollectionConfig } from 'payload'
import { getReqUser, hasStaffReq, isAppStaff, isAppStaffField } from '../access/kasafideAccess'
import {
  revalidateListingAfterChange,
  revalidateListingAfterDelete,
} from '../hooks/revalidateKasafide'

export const Listings: CollectionConfig = {
  slug: 'listings',
  admin: {
    useAsTitle: 'title',
    group: 'Kasafide Marketplace',
    defaultColumns: ['title', 'propertyType', 'listingType', 'price', 'barangay', 'status'],
  },
  access: {
    read: ({ req }): AccessResult => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id && user.role === 'seller') {
        return {
          or: [{ status: { equals: 'approved' } }, { seller: { equals: user.id } }],
        }
      }
      return { status: { equals: 'approved' } }
    },
    create: ({ req }) => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      return user?.collection === 'users' && user.role === 'seller'
    },
    update: ({ req }): AccessResult => {
      if (hasStaffReq(req)) return true
      const user = getReqUser(req)
      if (user?.collection === 'users' && user.id && user.role === 'seller') {
        return { seller: { equals: user.id } }
      }
      return false
    },
    delete: isAppStaff,
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (!data) return data
        const user = getReqUser(req)
        if (
          operation === 'create' &&
          !hasStaffReq(req) &&
          user?.collection === 'users' &&
          user.id
        ) {
          data.seller = user.id
          if (data.status !== 'draft') {
            data.status = 'pending'
          }
          data.titleVerified = false
        }
        return data
      },
    ],
    afterChange: [revalidateListingAfterChange],
    afterDelete: [revalidateListingAfterDelete],
  },
  fields: [
    { name: 'title', type: 'text', required: true, index: true },
    { name: 'slug', type: 'slug', useAsSlug: 'title' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved (Live)', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Closed / Occupied', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'propertyType',
          type: 'select',
          required: true,
          index: true,
          options: [
            { label: 'House', value: 'house' },
            { label: 'Apartment', value: 'apartment' },
            { label: 'Condo', value: 'condo' },
            { label: 'Commercial', value: 'commercial' },
            { label: 'Lot Only', value: 'lot' },
          ],
        },
        {
          name: 'listingType',
          type: 'select',
          required: true,
          index: true,
          options: [
            { label: 'For Rent', value: 'rent' },
            { label: 'For Sale', value: 'sale' },
          ],
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          index: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'barangay',
          type: 'relationship',
          relationTo: 'barangays',
          required: true,
          index: true,
        },
        { name: 'address', type: 'text', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'city', type: 'text', defaultValue: 'Sta. Maria' },
        { name: 'province', type: 'text', defaultValue: 'Bulacan' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'bedrooms', type: 'number', defaultValue: 0, min: 0 },
        { name: 'bathrooms', type: 'number', defaultValue: 0, min: 0 },
        { name: 'floorAreaSqm', type: 'number', min: 0 },
        { name: 'lotAreaSqm', type: 'number', min: 0 },
      ],
    },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'amenities',
      type: 'array',
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      type: 'row',
      fields: [
        { name: 'priceNegotiable', type: 'checkbox', defaultValue: false },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          access: { update: isAppStaffField },
        },
        {
          name: 'titleVerified',
          type: 'checkbox',
          defaultValue: false,
          access: { update: isAppStaffField },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'hasMultipleUnits', type: 'checkbox', defaultValue: false },
        { name: 'totalUnits', type: 'number', defaultValue: 1, min: 1 },
        { name: 'availableUnits', type: 'number', defaultValue: 1, min: 0 },
      ],
    },
    {
      name: 'ownershipDocType',
      type: 'select',
      defaultValue: 'tct',
      options: [
        { label: 'Transfer Certificate of Title (TCT)', value: 'tct' },
        { label: 'Deed of Absolute Sale', value: 'deed_of_sale' },
        { label: 'Tax Declaration', value: 'tax_declaration' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      // Supabase Storage path (private bucket) of the scanned title / deed / tax declaration the
      // seller attached. Opened by admins through a short-lived signed link.
      name: 'ownershipDocPath',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      // Public Supabase Storage URLs of the seller's own photos, first one is the cover.
      // When present these replace coverImage/gallery on every listing card and detail page.
      name: 'photoUrls',
      type: 'json',
      admin: { readOnly: true },
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      access: { update: isAppStaffField },
    },
  ],
  timestamps: true,
}
