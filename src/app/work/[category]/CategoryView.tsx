"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { caseMedia, type Category, type CaseStudy } from "@/lib/work";

/**
 * Category / area page — Figma "work branding" (6054:265) & "work campañas
 * publi" (6096:1162): "[N] CATEGORY" heading + a 3-column row-based grid.
 * Every project is exactly one photo + "[n] CLIENT (year)" — no pairs, no
 * per-column stagger. Hovering a project brightens it and reddens its name
 * (6129:1077); the rest dim.
 */
const RATIO: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};

export default function CategoryView({
  category,
  cases,
}: {
  category: Category;
  cases: CaseStudy[];
}) {
  const { t, locale } = useLocale();

  return (
    <section className="-mt-20 bg-cream px-6 pb-24 pt-[104px] md:-mt-[120px] md:px-[80px] md:pb-32 md:pt-[144px]">
      <h1 className="flex items-baseline gap-3 font-serif text-[clamp(1.5rem,3.4vw,2.5rem)] font-light uppercase leading-none tracking-[-0.03em] text-ink">
        <span className="text-sm tabular-nums text-ink/40">
          [{category.index}]
        </span>
        {category.name[locale]}
      </h1>

      <ul className="group/list mt-16 grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => {
          const ratio = RATIO[c.area?.ratio ?? "landscape"];
          const photo = caseMedia(c)[0];

          return (
            <li key={c.slug}>
              <Link
                href={`/work/${category.slug}/${c.slug}`}
                className="group block transition-opacity duration-300 group-hover/list:opacity-40 hover:!opacity-100"
              >
                <div className={`w-full overflow-hidden bg-mist ${ratio}`}>
                  {photo?.type === "image" && photo.src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.src}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>

                <div className="mt-3 flex items-start gap-2 text-[11px] uppercase leading-[1.3] tracking-[-0.04em]">
                  <span className="tabular-nums text-ink/40">[{c.index}]</span>
                  <span className="text-ink transition-colors group-hover:text-red">
                    {c.client}
                  </span>
                  <span className="ml-auto shrink-0 tabular-nums text-ink/40">
                    ({c.year})
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {cases.length === 0 && (
        <p className="mt-14 text-sm text-ink/50">
          {t({ es: "Pronto más proyectos.", en: "More projects soon." })}
        </p>
      )}

      <Link
        href="/work"
        className="mt-16 inline-block text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-red"
      >
        {t({ es: "Todas las categorías", en: "All categories" })}
      </Link>
    </section>
  );
}
