/**
 * Work — Figma structure confirmed with the user:
 *
 *   /work                     → "work general" index (6047:448): WHAT'S ON THE MENU
 *                               + the 6 category tiles.
 *   /work/[category]          → area page (6054:265 branding, 6096:1162 campañas):
 *                               "[n] CATEGORY" + editorial grid of cases; hover
 *                               brightens one and reddens its name (6129:1077).
 *   /work/[category]/[slug]   → case study — a fixed-height horizontal gallery
 *                               with a header row and ‹ › paging. Every image
 *                               opens a lightbox. Max 6 media.
 *
 * 3 publishing layouts (chosen per client in the future CMS via `version`):
 *   v1 = KISH&GO (6053:59)   — gallery-led, short text.
 *   v2 = Natuka  (6100:1282) — two text columns + big video + small images.
 *   v3 = VB Group(6109:26)   — one text column + one big video.
 * In practice the template just renders `blocks` left-to-right; `version` is
 * kept for the CMS and to seed sensible defaults.
 *
 * By explicit decision, every `branding` case is v1 (KISH&GO's design) —
 * `version: 1`, no `layout` object (that's what actually selects v2/v3 in
 * CaseStudyView, `version` alone doesn't). v2 and v3 stay implemented and in
 * use for `campanas` (Natuka, VB Group) so they're ready when needed, but
 * don't assign either to a branding case without asking first.
 *
 * Only `branding` and `campanas` are live; the other four categories show on
 * the index but don't link anywhere yet.
 *
 * ---------------------------------------------------------------------------
 * DATA SOURCE: categories and cases now live in `src/data/categories.json`
 * and `src/data/cases.json` (not hardcoded here anymore) so the /admin
 * backoffice can read and write them directly. This file just loads that
 * JSON, types it, and re-exports the same helpers everything else already
 * imports — no consumer of `work.ts` needed to change. When Supabase comes
 * in, only this loading step changes (JSON import → DB query); the exported
 * shape stays the same.
 * ---------------------------------------------------------------------------
 */

import categoriesData from "@/data/categories.json";
import casesData from "@/data/cases.json";

/** Client names for the two "stub" campañas cases share their brand's real
 * client, not the case title (title = campaign name, client = brand name). */

/** Work-index hover list: show at most this many clients, then "See all". */
export const MAX_REVEAL_CLIENTS = 15;

export type CategorySlug =
  | "branding"
  | "estrategia"
  | "contenido"
  | "web"
  | "campanas"
  | "eventos";

export type Category = {
  slug: CategorySlug;
  index: string;
  name: { es: string; en: string };
  enabled: boolean;
  /** Client names revealed on hover (Work index). */
  clients: string[];
  /** "listing" (default) = area page with a grid of client cases, each with
   * its own detail page. "manifesto" = one single page for the whole
   * category (Figma "Work estrategia I", 6116:69) — clients are named but
   * none of them has its own page. "pending" = clients are named (shown on
   * hover from the Work index) but the category page itself isn't designed
   * yet — just a "Diseño pendiente" placeholder. */
  kind?: "listing" | "manifesto" | "pending";
  /** Tile image on the Home "Participadas" row and /work index (Figma
   * 6013:15). Falls back to /media/services/<slug>.jpg when unset, so
   * existing data without this field keeps working. Editable from
   * /admin/work/[category]. */
  image?: string;
  /** SEO title/description overrides for /work/[category] — empty/unset
   * falls back to the auto-generated ones in generateMetadata. Editable
   * from /admin/work/[category]. */
  seoTitle?: string;
  seoDescription?: string;
};

export const CATEGORIES: Category[] = categoriesData as Category[];

export const getCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

export const ENABLED_CATEGORIES = CATEGORIES.filter((c) => c.enabled);

/* ---------------------------------------------------------------- cases --- */

type Lang = { es: string; en: string };

export type CaseBlock =
  | { type: "text"; variant: "lead" | "body"; content: Lang }
  | { type: "image"; src?: string; ratio?: "square" | "portrait" | "landscape" }
  | { type: "video"; src?: string; poster?: string };

export type MediaBlock = Extract<CaseBlock, { type: "image" | "video" }>;

/** One paragraph of storytelling copy; `emphasis` = the short red-highlighted
 * lines Figma uses as callouts (6100:1281 / 6109:25). */
export type CopyParagraph = { content: Lang; emphasis?: boolean };

/** v2 (Natuka, 6100:1281) / v3 (VB Group, 6109:25): a static two-region page
 * — 1 or 2 text columns beside one big hero media, optionally followed by a
 * secondary row of smaller media (v2 only). Different shape from v1's
 * horizontal-scroll `blocks` gallery. */
export type StaticLayout = {
  columns: CopyParagraph[][];
  media: MediaBlock;
  secondaryMedia?: MediaBlock[];
};

export type CaseStudy = {
  category: CategorySlug;
  slug: string;
  title: string;
  client: string;
  year: string; // "2026"
  index: string; // "01"
  version: 1 | 2 | 3;
  /** v1 (KISH&GO-style horizontal gallery). */
  blocks: CaseBlock[];
  /** v2 / v3 static layout — present instead of relying on `blocks`. */
  layout?: StaticLayout;
  /** How this case's thumbnail renders on the /work/[category] area page —
   * always exactly one photo + [n], client name and (year) (Figma 6054:265 /
   * 6096:1162) — independent of `blocks` (the case-detail gallery). `image`
   * is the brand's one identifying photo for that listing; when unset it
   * falls back to the first image/video in the case's own gallery (see
   * `caseMedia`), which is how every case behaved before this field
   * existed. */
  area?: { ratio?: "square" | "portrait" | "landscape"; image?: string };
  /** SEO title/description overrides for this case's page — empty/unset
   * falls back to the auto-generated ones in generateMetadata. Editable
   * from /admin/work/[category]/[slug]. */
  seoTitle?: string;
  seoDescription?: string;
};

export const CASES: CaseStudy[] = casesData as CaseStudy[];

export const casesByCategory = (slug: string) =>
  CASES.filter((c) => c.category === slug);

export const getCase = (category: string, slug: string) =>
  CASES.find((c) => c.category === category && c.slug === slug);

/**
 * Link target for a client name shown in the Work-index hover list. Only
 * clients that already have a published case study resolve to a URL; the
 * rest render as plain (non-clickable) text until their case is added.
 */
export const getCaseHref = (category: string, client: string): string | null => {
  const found = CASES.find(
    (c) =>
      c.category === category &&
      c.client.trim().toLowerCase() === client.trim().toLowerCase(),
  );
  return found ? `/work/${category}/${found.slug}` : null;
};

/** Image/video blocks of a case, capped at 8 — v1's gallery canvas
 * (GalleryLayout in CaseStudyView.tsx) has exactly 8 photo slots, so a case
 * can supply up to 8 distinct images with none repeated. v2/v3 cases carry
 * their media in `layout` instead of `blocks` and rarely need this many. */
export const caseMedia = (c: CaseStudy): MediaBlock[] =>
  c.layout
    ? [c.layout.media, ...(c.layout.secondaryMedia ?? [])].slice(0, 8)
    : c.blocks
        .filter((b): b is MediaBlock => b.type === "image" || b.type === "video")
        .slice(0, 8);

/** The one photo that identifies this case on the /work/[category] listing
 * (Figma 6054:265 / 6096:1162) — `area.image` when set (its own dedicated
 * field, editable from /admin), otherwise the first item of the case's own
 * gallery, which is how every case behaved before that field existed. */
export const caseThumbnail = (c: CaseStudy): MediaBlock | undefined =>
  c.area?.image ? { type: "image", src: c.area.image } : caseMedia(c)[0];

/** "2026" -> "[20 26]" as shown in the Figma case header. */
export const yearTag = (year: string) =>
  year.length === 4 ? `[${year.slice(0, 2)} ${year.slice(2)}]` : `[${year}]`;

/* ------------------------------------------------------------ live data --- */
/**
 * The exports above (CATEGORIES/CASES) are a build-time snapshot of
 * src/data/*.json — fine for things that only need to run at build time.
 * The functions below are what public pages should call instead once
 * Supabase is connected: they read straight from Supabase (falling back to
 * the same JSON snapshot when it isn't connected yet), so an edit made in
 * /admin shows up on the live site without a rebuild (combined with
 * `export const revalidate = ...` on the page).
 */
import { SUPABASE_ENABLED, supabasePublic } from "@/lib/supabase";

type CategoryRow = {
  slug: string;
  index: string;
  name_es: string;
  name_en: string;
  enabled: boolean;
  kind: string | null;
  clients: string[];
  image: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

type CaseRow = {
  category: string;
  slug: string;
  title: string;
  client: string;
  year: string;
  index: string;
  version: number;
  blocks: CaseBlock[];
  layout: StaticLayout | null;
  area: CaseStudy["area"] | null;
  seo_title: string | null;
  seo_description: string | null;
};

const categoryFromRow = (r: CategoryRow): Category => ({
  slug: r.slug as CategorySlug,
  index: r.index,
  name: { es: r.name_es, en: r.name_en },
  enabled: r.enabled,
  kind: (r.kind ?? undefined) as Category["kind"],
  clients: r.clients,
  image: r.image ?? undefined,
  seoTitle: r.seo_title ?? undefined,
  seoDescription: r.seo_description ?? undefined,
});

const caseFromRow = (r: CaseRow): CaseStudy => ({
  category: r.category as CategorySlug,
  slug: r.slug,
  title: r.title,
  client: r.client,
  year: r.year,
  index: r.index,
  version: r.version as CaseStudy["version"],
  blocks: r.blocks,
  layout: r.layout ?? undefined,
  area: r.area ?? undefined,
  seoTitle: r.seo_title ?? undefined,
  seoDescription: r.seo_description ?? undefined,
});

export async function getCategoriesLive(): Promise<Category[]> {
  if (!SUPABASE_ENABLED) return CATEGORIES;
  const { data, error } = await supabasePublic().from("categories").select("*").order("index");
  if (error) throw error;
  // Tables created but not migrated yet (or emptied by mistake) — fall back
  // to the JSON snapshot rather than rendering an empty site.
  if (!data || data.length === 0) return CATEGORIES;
  return (data as CategoryRow[]).map(categoryFromRow);
}

export async function getEnabledCategoriesLive(): Promise<Category[]> {
  return (await getCategoriesLive()).filter((c) => c.enabled);
}

export async function getCategoryLive(slug: string): Promise<Category | undefined> {
  return (await getCategoriesLive()).find((c) => c.slug === slug);
}

export async function getCasesLive(): Promise<CaseStudy[]> {
  if (!SUPABASE_ENABLED) return CASES;
  const { data, error } = await supabasePublic()
    .from("cases")
    .select("*")
    .order("category")
    .order("index");
  if (error) throw error;
  if (!data || data.length === 0) return CASES;
  return (data as CaseRow[]).map(caseFromRow);
}

export async function casesByCategoryLive(slug: string): Promise<CaseStudy[]> {
  return (await getCasesLive()).filter((c) => c.category === slug);
}

export async function getCaseLive(
  category: string,
  slug: string,
): Promise<CaseStudy | undefined> {
  return (await getCasesLive()).find((c) => c.category === category && c.slug === slug);
}

export async function getCaseHrefLive(
  category: string,
  client: string,
): Promise<string | null> {
  const cases = await getCasesLive();
  const found = cases.find(
    (c) =>
      c.category === category &&
      c.client.trim().toLowerCase() === client.trim().toLowerCase(),
  );
  return found ? `/work/${category}/${found.slug}` : null;
}
