import path from 'path'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Barangays } from './collections/Barangays'
import { Listings } from './collections/Listings'
import { ViewingRequests } from './collections/ViewingRequests'
import { Messages } from './collections/Messages'
import { Payments } from './collections/Payments'
import { Reviews } from './collections/Reviews'
import { VerificationSubmissions } from './collections/VerificationSubmissions'
import { ListingReports } from './collections/ListingReports'
import { Notifications } from './collections/Notifications'
import { AuditLogs } from './collections/AuditLogs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { en: adminLanguage },
  },
  collections: [
    Admins,
    Users,
    Barangays,
    Listings,
    ViewingRequests,
    Messages,
    Payments,
    Reviews,
    VerificationSubmissions,
    ListingReports,
    Notifications,
    AuditLogs,
    Media,
    Folders,
    Tags,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: true,
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
  plugins: [mcpPlugin({})],
})
