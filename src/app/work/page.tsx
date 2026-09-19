import type { Metadata } from "next";
import CategoryGrid from "@/components/CategoryGrid";
import { getCategoriesLive, getCasesLive } from "@/lib/work";
import { getSeoContentLive } from "@/lib/site-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContentLive();
  const page = seo.pages.work;
  const title = page.title || "Nuestro trabajo";
  const description = page.description || undefined;
  return {
    title,
    description,
    alternates: { canonical: "/work" },
    openGraph: description ? { title: `${title} | MARACA`, description } : undefined,
  };
}

/**
 * Work index — Figma "work general" (6047:448 / header 6047:449).
 * Header copy is set in English in the design regardless of locale (a
 * culinary pun that doesn't translate) — do not run it through t().
 *
 * Title "WHAT'S ON THE MENU.": Georgia Pro Light 44px / 120% / -6%, centered,
 * #1A1A1B, hard-wrapped to 2 lines ("WHAT'S ON" / "THE MENU.").
 * Subtitle "Here's what we've been cooking.": Georgia Pro Light Italic 30px /
 * 120% / -5%, centered, #1A1A1B.
 */
export default async function WorkPage() {
  const [categories, cases] = await Promise.all([getCategoriesLive(), getCasesLive()]);

  return (
    <section className="-mt-20 bg-cream pt-[92px] pb-24 md:-mt-[120px] md:pt-[136px]">
      {/* Bottom padding: the hover client-lists below rise into this space
          (title + up to MAX_REVEAL_CLIENTS lines) without touching this
          header. On mobile the tap-to-open list (see CategoryGrid) is
          capped at 160px, so this needs to clear at least that much — kept
          as tight as that allows. */}
      <header className="px-6 pb-44 text-center md:px-[120px] md:pb-[140px]">
        <h1 className="font-serif text-[clamp(1.75rem,3.05vw,2.75rem)] font-light uppercase leading-[1.2] tracking-[-0.06em] text-ink">
          <span className="block">What&apos;s on</span>
          <span className="block">the menu.</span>
        </h1>
        <p className="mt-3 font-serif text-[clamp(1.1rem,2.08vw,1.875rem)] font-light italic leading-[1.2] tracking-[-0.05em] text-ink">
          Here&apos;s what we&apos;ve been cooking.
        </p>
      </header>

      <CategoryGrid reveal categories={categories} cases={cases} />
    </section>
  );
}
