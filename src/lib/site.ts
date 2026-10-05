/** Shared site-wide constants for metadata, sitemap and robots.
 * NOTE: the real domain is lamaraca.com — update if it ever changes.
 * The editable SEO content itself (description, keywords, share image,
 * per-page titles/descriptions) lives in src/data/site-content.json /
 * Supabase — see src/lib/site-content.ts (SeoContent) and /admin/seo. */
export const SITE_URL = "https://www.lamaraca.com";
export const SITE_NAME = "MARACA — Creative House";

/** Company details used in structured data (kept in sync with the Aviso legal). */
export const COMPANY = {
  legalName: "MAMARACA S.L.",
  taxId: "B70635123",
  phone: "+34 662 66 92 86",
  street: "Calle Cartagena 64, 3B",
  postalCode: "28028",
  city: "Madrid",
  region: "Madrid",
  country: "ES",
};
