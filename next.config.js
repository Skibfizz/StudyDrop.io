/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'github.com',
      'i.ytimg.com',
      'img.youtube.com',
      'yt3.ggpht.com',
    ],
  },
}

module.exports = nextConfig 