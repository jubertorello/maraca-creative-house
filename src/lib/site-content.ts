/**
 * Editable content for fixed pages (Home, About, ...) that isn't a
 * category/case — hero videos, the "quiénes somos" copy, etc. Same
 * JSON-fallback / Supabase-when-connected pattern as work.ts and
 * clients.ts; see work.ts for the full explanation.
 */

import siteContentData from "@/data/site-content.json";
import { SUPABASE_ENABLED, supabasePublic } from "@/lib/supabase";

export type Lang = { es: string; en: string };

/** Every video in editable content has a desktop and a mobile cut — the
 * player picks whichever matches the viewport (see ResponsiveVideo.tsx).
 * `mobile` falls back to `desktop` when not set separately. */
export type ResponsiveVideo = { desktop: string; mobile?: string };

export type HomeContent = {
  heroVideo: ResponsiveVideo;
  /** Plain text with `*word or phrase*` marking the red-italic emphasis
   * chunks (see parseEmphasis below) — kept as a lightweight markup so this
   * stays a single plain-text field to edit instead of a structured list. */
  aboutText: Lang;
  recentWorkVideo: ResponsiveVideo;
};

export type AboutTextBlock = {
  title: Lang;
  body: Lang;
  /** block 1 is set in italic serif in the design; the rest in uppercase
   * sans — kept per-block so a new block can pick either. */
  bodyStyle: "italic" | "caps";
};

export type AboutContent = {
  heroVideo: ResponsiveVideo;
  /** The "Quiénes somos" blocks under the hero video. */
  blocks: AboutTextBlock[];
  /** Heading above the client-logos grid at the bottom of the page. */
  logosTitle: Lang;
};

export type PrivacyPolicySection = { heading: Lang; body: Lang };

export type PrivacyPolicyContent = {
  /** e.g. { es: "septiembre 2026", en: "September 2026" } — month name reads
   * differently per language, so this stays es/en rather than one string. */
  lastUpdated: Lang;
  sections: PrivacyPolicySection[];
};

/** Aviso legal — same shape as the privacy policy (title-less sections). */
export type LegalNoticeContent = PrivacyPolicyContent;

export type ContactContent = {
  /** The line above the email — "We're in Madrid, but good ideas tend to
   * travel:" (kept es/en even though today both are the same English text
   * per the Spanglish copy policy; either can be edited independently). */
  tagline: Lang;
  email: string;
  title: Lang;
};

export type TeamContent = {
  heroVideo: ResponsiveVideo;
  /** "Many minds, one creative house" — always shown as-is regardless of
   * locale, like the Home/Work taglines (a design choice, not an oversight;
   * see AGENTS.md-adjacent comments elsewhere in the codebase for the
   * pattern). One plain field, no es/en split. */
  tagline: string;
  joinUs: {
    title: Lang;
    paragraph1: Lang;
    paragraph2: Lang;
    email: string;
  };
};

/** One page's SEO fields — both optional: an empty one falls back to that
 * page's hardcoded default (see each page.tsx), so nothing needs editing
 * before it works. */
export type SeoPageFields = { title?: string; description?: string };

export type SeoPageKey = "home" | "about" | "team" | "work" | "contact" | "privacyPolicy";

export type SeoContent = {
  global: {
    /** Appended to every page's title as "<page title> | <titleSuffix>". */
    titleSuffix: string;
    /** Home's own title (it doesn't get the suffix appended — see Home's
     * generateMetadata comment for why). */
    defaultTitle: string;
    description: string;
    keywords: string[];
    /** Share-card image (OG/Twitter) — 1200×630 recommended. */
    ogImageUrl: string;
  };
  pages: Record<SeoPageKey, SeoPageFields>;
};

export type FooterSocialLink = { label: "Instagram" | "LinkedIn" | "TikTok"; href: string };

export type FooterContent = {
  email: string;
  socials: FooterSocialLink[];
};

type SiteContentData = {
  home: HomeContent;
  about: AboutContent;
  team: TeamContent;
  seo: SeoContent;
  privacyPolicy: PrivacyPolicyContent;
  legalNotice: LegalNoticeContent;
  contact: ContactContent;
  footer: FooterContent;
};

const STATIC: SiteContentData = siteContentData as SiteContentData;

async function readRow<K extends keyof SiteContentData>(id: K): Promise<SiteContentData[K]> {
  if (!SUPABASE_ENABLED) return STATIC[id];
  const { data, error } = await supabasePublic()
    .from("site_content")
    .select("data")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data?.data as SiteContentData[K]) ?? STATIC[id];
}

export const getHomeContentLive = () => readRow("home");
export const getAboutContentLive = () => readRow("about");
export const getTeamContentLive = () => readRow("team");
export const getSeoContentLive = () => readRow("seo");
export const getPrivacyPolicyContentLive = () => readRow("privacyPolicy");
export const getLegalNoticeContentLive = () => readRow("legalNotice");
export const getContactContentLive = () => readRow("contact");
export const getFooterContentLive = () => readRow("footer");

/** "Somos una *creative house* y *partner creativo*..." -> chunks, so the
 * component can render the starred parts as red italic without the field
 * needing to be structured data. */
export type EmphasisChunk = { text: string; emphasis?: boolean };

export function parseEmphasis(text: string): EmphasisChunk[] {
  const parts = text.split(/\*(.+?)\*/g);
  // split() with a capturing group alternates: [plain, emphasis, plain, emphasis, ...]
  return parts
    .map((part, i) => ({ text: part, emphasis: i % 2 === 1 }))
    .filter((c) => c.text.length > 0);
}
