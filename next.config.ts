import type { NextConfig } from "next";

// 301s from the previous (Wix) site's URLs, so links and rankings that point
// at the old pages carry over to the new ones once lamaraca.com is switched
// over. Wix paths are Spanish (/contacto, /portfolio...), the new ones English.
// (Accented paths are written percent-encoded, which is how they arrive.)
const oldSiteRedirects = [
  ["/portfolio", "/work"],
  ["/portfolio-collections", "/work"],
  ["/portfolio-collections/my-portfolio", "/work"],
  ["/portfolio-collections/my-portfolio/canica", "/work/branding/canica"],
  ["/portfolio-collections/my-portfolio/fosters-hollywood", "/work/campanas/fosters-hollywood-la-salsa"],
  ["/portfolio-collections/my-portfolio/mim", "/work/campanas/mim-shoes-universal-sneakers"],
  ["/portfolio-collections/my-portfolio/bestons-event", "/work/eventos"],
  // pasticcio, project-title-1..6 and anything else under the old portfolio
  ["/portfolio-collections/my-portfolio/:slug", "/work"],
  ["/contacto", "/contact"],
  ["/aviso-legal", "/legal-notice"],
  ["/pol%C3%ADtica-de-privacidad", "/privacy-policy"],
  // no cookies page on the new site (no tracking cookies are set yet) —
  // privacy policy is the closest equivalent
  ["/pol%C3%ADtica-de-cookies", "/privacy-policy"],
].map(([source, destination]) => ({ source, destination, permanent: true }));

const nextConfig: NextConfig = {
  images: {
    // Cloudinary-hosted media (uploaded from /admin) — see
    // src/lib/cloudinary.ts and /api/admin/upload.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async redirects() {
    return oldSiteRedirects;
  },
};

export default nextConfig;
