/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    domains: ['localhost'],
  },
  output: 'export',
  assetPrefix: process.env.GITHUB_PAGES ? '/ASHAAIBOT/' : undefined,
  basePath: process.env.GITHUB_PAGES ? '/ASHAAIBOT' : undefined,
}

module.exports = nextConfig 