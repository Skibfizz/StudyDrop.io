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
  // Add this to explicitly set which router to use
  experimental: {
    appDir: true, // Set to true to use App Router
  },
};

module.exports = nextConfig;
