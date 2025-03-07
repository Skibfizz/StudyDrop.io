/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['lh3.googleusercontent.com'],
  },
  // Ensure API routes are treated as dynamic
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  env: {
    SUPADATA_API_KEY: process.env.SUPADATA_API_KEY,
  }
};

module.exports = nextConfig;
