import type { CollectionConfig } from 'payload'

import { createFolderField, createTagField } from 'payload'
import { isAppStaff } from '../access/kasafideAccess'
import { revalidateMediaAfterChange, revalidateMediaAfterDelete } from '../hooks/revalidateKasafide'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: isAppStaff,
    delete: isAppStaff,
  },
  hooks: {
    afterChange: [revalidateMediaAfterChange],
    afterDelete: [revalidateMediaAfterDelete],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  upload: {
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
      return headers
    },
  },
}
