import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudinary-hosted media (uploaded from /admin) — see
    // src/lib/cloudinary.ts and /api/admin/upload.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
