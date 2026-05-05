import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
    qualities: [60, 75, 85, 95],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  serverExternalPackages: ["bcryptjs", "@prisma/client"],
};

export default nextConfig;
