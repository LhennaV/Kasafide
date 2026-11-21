import type { CollectionConfig } from 'payload'
import { isAppStaff, isAppSuperAdmin } from '../access/kasafideAccess'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'action',
    group: 'Kasafide Trust & Safety',
    defaultColumns: ['actorName', 'actorRole', 'action', 'status', 'createdAt'],
  },
  access: {
    read: isAppStaff,
    create: isAppStaff,
    update: isAppSuperAdmin,
    delete: isAppSuperAdmin,
  },
  fields: [
    { name: 'actorName', type: 'text', required: true },
    { name: 'actorEmail', type: 'text' },
    {
      name: 'actorRole',
      type: 'select',
      required: true,
      options: [
        { label: 'Buyer', value: 'buyer' },
        { label: 'Seller', value: 'seller' },
        { label: 'Admin', value: 'admin' },
        { label: 'Super Admin', value: 'superadmin' },
        { label: 'System', value: 'system' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'action', type: 'text', required: true, index: true },
    { name: 'ipAddress', type: 'text', defaultValue: '120.28.64.18' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'success',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'details', type: 'textarea' },
  ],
  timestamps: true,
}
