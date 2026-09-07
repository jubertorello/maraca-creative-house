import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { ENABLED_CATEGORIES, CASES } from "@/lib/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/work`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/team`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.6 },
    // /privacy-policy is marked `noindex` (see its own metadata) — left out
    // of the sitemap on purpose, don't add it back without removing that.
  ];

  // "pending" categories (Creación de contenido, Diseño web, Eventos,
  // Campañas) just show "Diseño pendiente" right now — thin/no-content
  // pages aren't worth submitting for indexing until they have a real
  // design (they're also marked `noindex` — see generateMetadata there).
  const categoryRoutes: MetadataRoute.Sitemap = ENABLED_CATEGORIES.filter(
    (c) => c.kind !== "pending",
  ).map((c) => ({
    url: `${SITE_URL}/work/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Every case gets a static detail page regardless of its category's own
  // listing state (see generateStaticParams in [slug]/page.tsx) — none are
  // filed under the "manifesto" category (Estrategia), which has no cases.
  const caseRoutes: MetadataRoute.Sitemap = CASES.map((study) => ({
    url: `${SITE_URL}/work/${study.category}/${study.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...caseRoutes];
}
