import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingIncludes: {
    "/api/*": ["./certs/db-cacert.pem"],
  },
};

export default nextConfig;
