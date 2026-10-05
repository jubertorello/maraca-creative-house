"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useLocale } from "@/lib/i18n";
import { caseThumbnail, type Category, type CaseStudy } from "@/lib/work";
import { cldOptimize } from "@/lib/cloudinary-url";

/**
 * Category / area page — Figma "work branding" (6054:265) & "work campañas
 * publi" (6096:1162): "[N] CATEGORY" heading + a staggered masonry of cases.
 * Every project is exactly one photo (its own small "[n]" tag pinned to the
 * top-right corner) + "[n] CLIENT (year)" caption below it. The middle and
 * right columns are nudged down a different amount each so cases don't line
 * up in even rows, matching the uneven, editorial rhythm of the reference
 * layout — a plain grid rather than CSS multi-column, which leaves ugly
 * gaps when it has to balance columns around tall, unsplittable items.
 * Hovering a project brightens it and reddens its name (6129:1077); the
 * rest dim.
 */
const RATIO: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};

/** Per-column vertical nudge at the 3-col (lg) breakpoint, by `index % 3`. */
const STAGGER = ["", "lg:mt-16", "lg:mt-8"];

/**
 * "Feature cards 5" (Figma "work branding", exact CSS supplied 2026-09-03):
 * an auto-layout row, 178px tall, 4px gaps — cards are either a centered
 * "[n] CLIENT [year]" caption (bg cream, ~233px) or a bare photo (bg white),
 * each its own fixed width. Widths below are the exact px from that export;
 * `flexGrow` on each cell reproduces their exact proportions at any
 * viewport width instead of the literal 1263px canvas size. Every photo's
 * "[n]" sits in its own line *above* it (never overlaid on the image), and
 * Maruch's caption isn't inline in the row at all — Figma places it
 * floating below-right of its own photo (exact px also supplied), so it's
 * positioned as a percentage of that photo's own box (left 70/252 = 27.78%,
 * top 58/178 = 32.58% past its bottom) so it scales with it at any width.
 *
 * All 15 branding cases are covered by rows 1-5 below, each with its own
 * exact CSS — they are NOT mechanically repeated copies of one another
 * (an earlier attempt to reuse row 1/2's shape for rows 4/5 was wrong; each
 * row's card order, widths and any floating caption's position are unique
 * and were each supplied separately).
 *
 * That's the full set of 5 distinct row designs. Per explicit instruction,
 * if more branding cases are added beyond these 15, rows repeat from here
 * on: row 6 = row 1's shape, row 7 = row 2's, row 8 = row 3's, and so on —
 * cycling through rows 1-5 in order for however many new cases there are.
 */
type ExtraCaption = { slug: string; leftPct: number; topPct: number };
type FeatureCell =
  | { kind: "text"; slug: string; width: number; textWidth?: number; yearOnOwnLine?: boolean }
  | { kind: "image"; slug: string; width: number; extraCaption?: ExtraCaption };

const BRANDING_ROWS: FeatureCell[][] = [
  [
    { kind: "text", slug: "kish-and-go", width: 233 },
    { kind: "image", slug: "kish-and-go", width: 254 },
    {
      kind: "image",
      slug: "maruch",
      width: 252,
      extraCaption: { slug: "maruch", leftPct: 27.78, topPct: 32.58 },
    },
    { kind: "text", slug: "unrated", width: 253 },
    { kind: "image", slug: "unrated", width: 253 },
  ],
  // "Feature cards 6" (exact CSS supplied 2026-09-03): Joia by Buccara's
  // photo comes first, its caption floating below it (same trick as
  // Maruch's, left 56/254 = 22.05%, top 52/178 = 29.21%); Awake's caption
  // is inline, then its own photo; then Mesonero-Romanos' photo, then its
  // (wider, 137px) inline caption.
  [
    {
      kind: "image",
      slug: "joia-by-buccara",
      width: 254,
      extraCaption: { slug: "joia-by-buccara", leftPct: 22.05, topPct: 29.21 },
    },
    { kind: "text", slug: "awake", width: 233, textWidth: 92 },
    { kind: "image", slug: "awake", width: 253 },
    { kind: "image", slug: "mesonero-romanos", width: 252 },
    { kind: "text", slug: "mesonero-romanos", width: 253, textWidth: 137, yearOnOwnLine: true },
  ],
  // "Feature cards 7" (exact CSS supplied 2026-09-03): Espacio Trimmings'
  // photo first, caption floating below it — same position as Joia's in
  // row 2 (per direct instruction: "la marca 1 es igual a la marca 1 de la
  // fila 2"). Then CarpaDiem's own photo + inline caption, then Laberinto
  // Studio's own photo + inline caption.
  [
    {
      kind: "image",
      slug: "espacio-trimmings",
      width: 253,
      extraCaption: { slug: "espacio-trimmings", leftPct: 22.05, topPct: 29.21 },
    },
    { kind: "image", slug: "carpadiem", width: 254 },
    { kind: "text", slug: "carpadiem", width: 233, textWidth: 123 },
    { kind: "image", slug: "laberinto-studio", width: 252 },
    { kind: "text", slug: "laberinto-studio", width: 253, textWidth: 160 },
  ],
  // "Feature cards 8" (exact CSS supplied 2026-09-03): Beatriz Ortiz
  // Clinic's caption inline, then its own photo; Volver a Casa's own photo,
  // then its (wider, 2-line) inline caption; Milton Education's photo with
  // its caption floating below (left 63/253 = 24.90%, top 52/178 = 29.21%).
  [
    { kind: "text", slug: "beatriz-ortiz-clinic", width: 233, textWidth: 151 },
    { kind: "image", slug: "beatriz-ortiz-clinic", width: 254 },
    { kind: "image", slug: "volver-a-casa", width: 252 },
    { kind: "text", slug: "volver-a-casa", width: 253, textWidth: 157, yearOnOwnLine: true },
    {
      kind: "image",
      slug: "milton-education",
      width: 253,
      extraCaption: { slug: "milton-education", leftPct: 24.9, topPct: 29.21 },
    },
  ],
  // "Feature cards 9" (exact CSS supplied 2026-09-03): Beston's own photo +
  // inline caption; Canica's photo with its caption floating below (left
  // 71/253 = 28.06%, top 73/178 = 41.01% — a taller drop than the other
  // rows'); Natuka's own photo + inline caption.
  [
    { kind: "image", slug: "beston", width: 254 },
    { kind: "text", slug: "beston", width: 233, textWidth: 96 },
    {
      kind: "image",
      slug: "canica",
      width: 253,
      extraCaption: { slug: "canica", leftPct: 28.06, topPct: 41.01 },
    },
    { kind: "image", slug: "natuka-branding", width: 252 },
    { kind: "text", slug: "natuka-branding", width: 253 },
  ],
];

/** Rows 6, 7, 8... for cases beyond the ones the Figma rows name: row 6
 * reuses row 1's shape, row 7 row 2's, and so on, cycling through
 * `templates`. Each template row has its own number of distinct cases (3
 * today), filled in order from `slugs`; a last row with fewer cases than its
 * template keeps the template's proportions (missing cells render as empty
 * spacers — see FeatureRow) instead of stretching what's left. */
function buildRepeatedRows(templates: FeatureCell[][], slugs: string[]): FeatureCell[][] {
  const rows: FeatureCell[][] = [];
  let next = 0;
  for (let r = 0; next < slugs.length; r++) {
    const tpl = templates[r % templates.length];
    const distinct = [
      ...new Set(
        tpl.flatMap((c) =>
          c.kind === "image" && c.extraCaption ? [c.slug, c.extraCaption.slug] : [c.slug],
        ),
      ),
    ];
    const bySlug = new Map(distinct.map((s, i) => [s, slugs[next + i] ?? ""]));
    next += distinct.length;
    rows.push(
      tpl.map((cell) => {
        const slug = bySlug.get(cell.slug) ?? "";
        if (cell.kind === "image" && cell.extraCaption) {
          return { ...cell, slug, extraCaption: { ...cell.extraCaption, slug } };
        }
        return { ...cell, slug };
      }),
    );
  }
  return rows;
}

/** The "[n] CLIENT [year]" text, shared by the row's text cells and by an
 * image's floating `extraCaption`. `width` matches the Figma text layer's
 * own box (it varies per client — short names get a narrower box).
 * `yearOnOwnLine`: for a client name long enough to wrap to 2 lines, the
 * year drops to its own line below (right-aligned) instead of trailing the
 * name on one line — e.g. Mesonero-Romanos Studio. */
function CaptionText({
  study,
  width = 112,
  yearOnOwnLine = false,
  active,
}: {
  study: CaseStudy;
  width?: number;
  yearOnOwnLine?: boolean;
  /** Forces red text from state instead of this element's own CSS :hover —
   * FeatureRow's photo and caption are separate elements for the same case
   * (exact Figma row), so they need to redden together no matter which one
   * the mouse is actually over. Omit to fall back to plain group-hover
   * (self-contained callers, e.g. MobileFeatureList, where the photo and
   * caption share one Link and CSS alone is enough). */
  active?: boolean;
}) {
  const colorClass =
    active === undefined
      ? "text-ink transition-colors group-hover:text-red"
      : `transition-colors ${active ? "text-red" : "text-ink"}`;
  return (
    <span
      style={{ width }}
      className={`text-[12px] font-extralight uppercase leading-[1.2] tracking-[-0.06em] ${colorClass}`}
    >
      <span className="block">[{parseInt(study.index, 10)}]</span>
      {yearOnOwnLine ? (
        <>
          <span className="mt-[10px] block">{study.client}</span>
          <span className="mt-[10px] block text-right">[{study.year}]</span>
        </>
      ) : (
        <span className="mt-[10px] flex items-baseline justify-between gap-2">
          <span>{study.client}</span>
          <span>[{study.year}]</span>
        </span>
      )}
    </span>
  );
}

/** A floating `extraCaption` is `position:absolute`, so it doesn't push
 * anything — left alone, the next row would start while it's still hanging
 * below this one and the two would overlap. This reserves that space as
 * `padding-bottom` on the row itself (in the same "% of the row's own
 * width" units as everything else here, so it scales with it), sized to
 * the deepest floating caption the row has. */
function rowReservedSpacePct(cells: FeatureCell[]): number {
  const ROW_DESIGN_WIDTH = 1263;
  const ROW_DESIGN_HEIGHT = 178;
  const CAPTION_HEIGHT = 42;
  return cells.reduce((max, cell) => {
    if (cell.kind !== "image" || !cell.extraCaption) return max;
    const extraPx = (cell.extraCaption.topPct / 100) * ROW_DESIGN_HEIGHT + CAPTION_HEIGHT;
    return Math.max(max, (extraPx / ROW_DESIGN_WIDTH) * 100);
  }, 0);
}

/** The exact Figma row, `lg` and up only — below that, `MobileFeatureList`
 * takes over with a much simpler stacked layout instead (same type/image
 * styling, none of the precise widths or floating captions, which don't
 * make sense on a single mobile column anyway). */
function FeatureRow({
  cells,
  category,
  getCase,
  hoveredSlug,
  onHoverSlug,
}: {
  cells: FeatureCell[];
  category: string;
  /** Looks up a case by slug in the *live* cases passed into CategoryView
   * (Supabase-backed, includes admin edits) — never the static build-time
   * `@/lib/work` CASES snapshot, which is stale the moment someone edits a
   * case's thumbnail or anything else from /admin. */
  getCase: (slug: string) => CaseStudy | undefined;
  /** A case's photo, caption and floating extraCaption are separate
   * elements here (the exact Figma row splits them into their own flex
   * cells) but represent one card — this (lifted to CategoryView, shared
   * with every row) is what makes hovering any one of them redden/brighten
   * all the others for the same slug, instead of each reacting only to its
   * own CSS :hover. */
  hoveredSlug: string | null;
  onHoverSlug: (slug: string | null) => void;
}) {
  const reservedPct = rowReservedSpacePct(cells);

  return (
    <div
      style={reservedPct > 0 ? ({ "--rowPb": `${reservedPct}%` } as CSSProperties) : undefined}
      className={`hidden items-start gap-1 lg:flex ${reservedPct > 0 ? "lg:[padding-bottom:var(--rowPb)]" : ""}`}
    >
      {cells.map((cell, i) => {
        const study = getCase(cell.slug);
        const growStyle = { flexGrow: cell.width, flexBasis: 0 } as CSSProperties;
        if (!study) return <div key={i} style={growStyle} className="min-w-0" />;
        const href = `/work/${category}/${cell.slug}`;
        const photo = caseThumbnail(study);
        const isActive = hoveredSlug === cell.slug;

        // Hover is driven by the photo only: hovering it reddens that case's
        // caption/number and dims every other case. The captions themselves
        // are plain links — they don't start (or take part in) any hover.
        const dim = `transition-opacity duration-300 ${hoveredSlug && !isActive ? "opacity-40" : ""}`;

        if (cell.kind === "text") {
          return (
            <Link
              key={i}
              href={href}
              style={{ aspectRatio: `${cell.width} / 178`, ...growStyle }}
              className={`flex min-w-0 items-center justify-center bg-cream ${dim}`}
            >
              <CaptionText
                study={study}
                width={cell.textWidth}
                yearOnOwnLine={cell.yearOnOwnLine}
                active={isActive}
              />
            </Link>
          );
        }

        const extra = cell.extraCaption ? getCase(cell.extraCaption.slug) : null;

        return (
          <div key={i} style={growStyle} className="flex min-w-0 flex-col">
            {/* the photo's own number — its own line above it, never
                overlaid on the image itself, right-aligned over it */}
            <span
              className={`mb-2 text-right text-[12px] font-extralight tracking-[-0.06em] tabular-nums transition-colors ${isActive ? "text-red" : "text-ink"}`}
            >
              [{parseInt(study.index, 10)}]
            </span>

            <div className="relative" style={{ aspectRatio: `${cell.width} / 178` }}>
              <Link
                href={href}
                onMouseEnter={() => onHoverSlug(cell.slug)}
                onMouseLeave={() => onHoverSlug(null)}
                className={`absolute inset-0 block overflow-hidden bg-white ${dim}`}
              >
                {photo?.type === "image" && photo.src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cldOptimize(photo.src)}
                    alt=""
                    className={`h-full w-full object-cover transition-transform duration-500 ${isActive ? "scale-[1.03]" : ""}`}
                  />
                )}
              </Link>

              {/* Maruch-style floating caption, positioned relative to its
                  own photo's box exactly like the supplied Figma px. Always
                  the same slug as the photo it floats under (see
                  BRANDING_ROWS), so it shares that same `isActive`. */}
              {extra && cell.extraCaption && (
                <Link
                  href={`/work/${category}/${cell.extraCaption.slug}`}
                  style={{
                    left: `${cell.extraCaption.leftPct}%`,
                    top: `calc(100% + ${cell.extraCaption.topPct}%)`,
                  }}
                  className={`absolute ${dim}`}
                >
                  <CaptionText study={extra} active={isActive} />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Mobile/tablet (below `lg`): drop the exact Figma row entirely — just
 * "[n] CLIENT [year]", its photo, next one below, in numeric order. Every
 * case named across all `rows` (including ones whose caption only exists as
 * a desktop-only floating extra, like Maruch/Joia) gets exactly one
 * text+photo pair here, deduped by slug, first-seen order. */
function MobileFeatureList({
  rows,
  category,
  getCase,
}: {
  rows: FeatureCell[][];
  category: string;
  getCase: (slug: string) => CaseStudy | undefined;
}) {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const cell of rows.flat()) {
    if (!seen.has(cell.slug)) {
      seen.add(cell.slug);
      slugs.push(cell.slug);
    }
    if (cell.kind === "image" && cell.extraCaption && !seen.has(cell.extraCaption.slug)) {
      seen.add(cell.extraCaption.slug);
      slugs.push(cell.extraCaption.slug);
    }
  }

  return (
    <div className="mt-16 flex flex-col gap-24 lg:hidden">
      {slugs.map((slug) => {
        const study = getCase(slug);
        if (!study) return null;
        const photo = caseThumbnail(study);
        return (
          <Link
            key={slug}
            href={`/work/${category}/${slug}`}
            className="group block transition-opacity duration-300 group-hover/list:opacity-40 hover:!opacity-100"
          >
            <CaptionText study={study} />
            <span className="mb-2 mt-4 block text-right text-[12px] font-extralight tracking-[-0.06em] tabular-nums text-ink transition-colors group-hover:text-red">
              [{parseInt(study.index, 10)}]
            </span>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
              {photo?.type === "image" && photo.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cldOptimize(photo.src)}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function CategoryView({
  category,
  cases,
}: {
  category: Category;
  cases: CaseStudy[];
}) {
  const { t, locale } = useLocale();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const templateRows = category.slug === "branding" ? BRANDING_ROWS : [];
  const templateSlugs = new Set(templateRows.flat().map((cell) => cell.slug));
  const extraSlugs = cases.filter((c) => !templateSlugs.has(c.slug)).map((c) => c.slug);
  // Branding: every case beyond the 15 the Figma rows name keeps going in
  // the same row designs, repeating from row 1 (see buildRepeatedRows).
  const exactRows =
    templateRows.length > 0
      ? [...templateRows, ...buildRepeatedRows(templateRows, extraSlugs)]
      : [];
  const remainingCases = templateRows.length > 0 ? [] : cases;

  // Looks up a case by slug in the *live* `cases` prop (Supabase-backed —
  // reflects admin edits immediately) instead of the static build-time
  // `@/lib/work` CASES snapshot, which FeatureRow/MobileFeatureList used to
  // read from directly — stale the moment a thumbnail or anything else got
  // edited from /admin, e.g. a newly-set case thumbnail never showing up.
  const caseBySlug = new Map(cases.map((c) => [c.slug, c]));
  const getLiveCase = (slug: string) => caseBySlug.get(slug);

  return (
    <section className="-mt-20 bg-cream px-6 pb-24 pt-[104px] md:-mt-[120px] md:px-[80px] md:pb-32 md:pt-[144px]">
      <div className="flex items-baseline justify-between gap-6">
        <h1 className="flex items-baseline gap-3 font-serif text-[clamp(1rem,1.7vw,1.5rem)] font-light uppercase leading-[1.2] tracking-[-0.06em] text-ink">
          <span className="tabular-nums">[{category.index}]</span>
          {category.name[locale]}
        </h1>
        <Link
          href="/work"
          className="shrink-0 text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-red"
        >
          {t({ es: "Volver", en: "Back" })}
        </Link>
      </div>

      {/* `group/list` is shared by the exact rows above and the generic
          grid below, so hovering any card anywhere on the page dims every
          other one — one consistent hover behavior across the whole
          listing, not just within each section. */}
      <div className="group/list">
        {exactRows.length > 0 && (
          <>
            {/* FeatureRow itself is `hidden lg:flex`; this wrapper's own
                visibility/spacing follows suit so it doesn't leave a stray
                margin gap on mobile when its children render nothing. */}
            <div className="hidden lg:mt-16 lg:flex lg:flex-col lg:gap-12">
              {exactRows.map((cells, i) => (
                <FeatureRow
                  key={i}
                  cells={cells}
                  category={category.slug}
                  getCase={getLiveCase}
                  hoveredSlug={hoveredSlug}
                  onHoverSlug={setHoveredSlug}
                />
              ))}
            </div>
            <MobileFeatureList rows={exactRows} category={category.slug} getCase={getLiveCase} />
          </>
        )}

        {remainingCases.length > 0 && (
        <ul className="mt-16 grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {remainingCases.map((c, i) => {
          const ratio = RATIO[c.area?.ratio ?? "landscape"];
          const photo = caseThumbnail(c);
          const n = parseInt(c.index, 10);

          return (
            <li key={c.slug} className={STAGGER[i % 3]}>
              <Link
                href={`/work/${category.slug}/${c.slug}`}
                className="group block transition-opacity duration-300 group-hover/list:opacity-40 hover:!opacity-100"
              >
                {/* [n] lives in the caption line below, not overlaid on the
                    photo itself */}
                <div className={`w-full overflow-hidden bg-mist ${ratio}`}>
                  {photo?.type === "image" && photo.src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cldOptimize(photo.src)}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>

                <div className="mt-3 flex items-start gap-2 text-[11px] uppercase leading-[1.3] tracking-[-0.04em]">
                  <span className="tabular-nums text-ink/40 transition-colors group-hover:text-red">
                    [{n}]
                  </span>
                  <span className="text-ink transition-colors group-hover:text-red">
                    {c.client}
                  </span>
                  <span className="ml-auto shrink-0 tabular-nums text-ink/40 transition-colors group-hover:text-red">
                    [{c.year}]
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
        </ul>
        )}
      </div>

      {cases.length === 0 && (
        <p className="mt-14 text-sm text-ink/50">
          {t({ es: "Pronto más proyectos.", en: "More projects soon." })}
        </p>
      )}
    </section>
  );
}
