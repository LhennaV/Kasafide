import type { CollectionConfig } from 'payload'
import { isAppStaff } from '../access/kasafideAccess'
import {
  revalidateBarangayAfterChange,
  revalidateBarangayAfterDelete,
} from '../hooks/revalidateKasafide'

export const Barangays: CollectionConfig = {
  slug: 'barangays',
  admin: {
    useAsTitle: 'name',
    group: 'Kasafide Marketplace',
    defaultColumns: ['name', 'slug', 'mapX', 'mapY'],
  },
  access: {
    read: () => true,
    create: isAppStaff,
    update: isAppStaff,
    delete: isAppStaff,
  },
  hooks: {
    afterChange: [revalidateBarangayAfterChange],
    afterDelete: [revalidateBarangayAfterDelete],
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, index: true },
    { name: 'slug', type: 'slug', useAsSlug: 'name' },
    {
      type: 'row',
      fields: [
        { name: 'mapX', type: 'number', required: true },
        { name: 'mapY', type: 'number', required: true },
      ],
    },
    { name: 'featuredDescription', type: 'text' },
  ],
  timestamps: true,
}
