import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'sejxjzonvgynzsfpcxuy.supabase.co',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/authors',
        destination: '/explore?view=authors',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
