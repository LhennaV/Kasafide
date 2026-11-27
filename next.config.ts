import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  // Conditionally disable standalone output when building on Netlify
  ...(process.env.NETLIFY ? {} : { output: 'standalone' }),
  images: {
    loader: 'custom',
    loaderFile: './payload-image-loader.ts',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  enablePrerenderSourceMaps: false,
  experimental: {
    cpus: 2,
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
  // Signed-in pages must never be stored by the browser or a CDN: after logout, opening a
  // copied portal link has to reach the server (which sends it to sign-in), not a saved copy.
  async headers() {
    return [
      {
        source: '/module/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' }],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
