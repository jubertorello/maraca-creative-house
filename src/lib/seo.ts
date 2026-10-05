import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { getSeoContentLive } from "@/lib/site-content";

/** Trims a description to a length search results don't cut off (~160 chars),
 * at a word boundary. */
export function clip(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

/**
 * Full Open Graph + Twitter block for a page. A page-level `openGraph` in
 * Next.js *replaces* the root layout's instead of merging with it, so a page
 * that only sets title/description loses the share image, site name, locale
 * and url — which is exactly what link previews (WhatsApp, LinkedIn,
 * Instagram DMs, Slack) read. Every page goes through this instead.
 */
export async function pageSocial({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string;
}): Promise<Pick<Metadata, "openGraph" | "twitter">> {
  const seo = await getSeoContentLive();
  const img = image || seo.global.ogImageUrl;
  const fullTitle = `${title} | MARACA`;
  return {
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: path,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [{ url: img, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [img],
    },
  };
}
