import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5022"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
