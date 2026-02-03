import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid monorepo root inference issues when deploying/building.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
