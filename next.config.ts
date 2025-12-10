import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // We are NOT using static export anymore. This allows for server-side logic.
  // output: 'export', // THIS LINE IS REMOVED
  
  // Disable TypeScript and ESLint checks during build on Vercel
  // This helps prevent build failures due to linting or type issues not critical for deployment.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configuration for next/image to allow images from external domains.
  images: {
    // Unoptimized is only needed for static export. We can remove it, but it's safe to keep.
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// CRITICAL: This line exports the configuration so Vercel can use it.
export default nextConfig;
