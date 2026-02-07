/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@escape-tour/shared', '@escape-tour/game-logic', '@escape-tour/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  output: 'standalone',
}

module.exports = nextConfig
