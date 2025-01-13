import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'ucarecdn.com',
      },
    ],
  },
  typescript:{
    ignoreBuildErrors: true,
  },
   eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
