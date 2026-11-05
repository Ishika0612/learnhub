import type { NextConfig } from "next";

const apiUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  "http://localhost:8000",
);
const apiPath = apiUrl.pathname.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  experimental: {
    agentUpgrade: "security",
  },
  async rewrites() {
    return [
      {
        source: `${apiPath}/:path*`,
        destination: `${apiUrl.origin}${apiPath}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiUrl.origin}/uploads/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
