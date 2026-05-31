import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker
  output: "standalone",

  // Turbopack root (suppress warning)
  turbopack: {
    root: __dirname,
  },

  // Allow cross-origin requests in dev
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:8000"],
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
