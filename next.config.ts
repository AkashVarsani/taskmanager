import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static page generation for dynamic API routes
  experimental: {
    // Ensure dynamic routes are handled correctly
  },
  // Use standalone output for better Railway compatibility
  output: 'standalone',
};

export default nextConfig;
