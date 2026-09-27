import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["typescript", "playwright", "sql.js", "@prisma/client"],
  experimental: {
    // Keep build-time page workers within a small local machine's memory budget.
    cpus: 1,
    serverActions: {
      // Progress import posts the whole backup JSON to a server action; a long
      // history (attempts carry submitted code) outgrows the 1 MB default.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
