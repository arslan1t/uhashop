import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "*.firebasestorage.app" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
    // Serve images directly instead of via the Vercel Image Optimization proxy.
    // That proxy (/_next/image) was returning 402 (monthly optimization quota
    // exceeded), which broke EVERY <Image> on the site — avatars, set albums,
    // product photos. Uploads are already client-compressed (<=1800px), so the
    // size cost of skipping optimization is small. Re-enable if you upgrade the
    // Vercel plan / image quota.
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
};

export default withNextIntl(nextConfig);
