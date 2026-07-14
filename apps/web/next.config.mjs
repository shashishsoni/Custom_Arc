/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@customarc/shared', '@customarc/design'],
  typedRoutes: true,
}

export default nextConfig
