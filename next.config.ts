import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.CIUNAC_E2E === '1' ? '.next-e2e' : '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      }
    ],
  },

};

export default nextConfig;
