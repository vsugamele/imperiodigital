import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid monorepo root inference issues when deploying/building.
  // Avoid monorepo root inference issues when deploying/building.
  outputFileTracingRoot: process.cwd(),

  // Disable Turbopack for build (has issues with Node.js fs module)
  // Turbopack will still be used for dev mode by default
  experimental: {
    // Use webpack for production builds
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
