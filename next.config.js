/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16: use serverExternalPackages for external dependencies in Server Components
  serverExternalPackages: ['xlsx', 'papaparse'],
}

module.exports = nextConfig
