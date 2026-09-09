"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import Lightbox from "@/components/Lightbox";
import { cldOptimize } from "@/lib/cloudinary-url";
import {
  getCategory,
  casesByCategory,
  caseMedia,
  yearTag,
  type CaseStudy,
  type CaseBlock,
  type MediaBlock,
} from "@/lib/work";

/**
 * Case study — 3 publishing layouts, chosen per client in the future CMS:
 *   v1 = KISH&GO (6053:58)   — editorial grid: hero + copy, lead + a 2-up
 *                               row, a 2-image side stack; ‹ › page to the
 *                               previous/next case in the category.
 *   v2 = Natuka  (6100:1281) — 2 text columns + 1 big video + a 2-image row.
 *   v3 = VB Group(6109:25)   — 1 text column + 1 big video.
 * Header row (title · index · category · year · Volver) is shared by all three.
 */
/** Thin-stroke × (Figma "x-light", 14×14 — inner vector inset ~19.5% on
 * every side), used instead of a text "×" glyph. */
function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={`h-full w-full ${className}`}>
      <path d="M2.75 2.75L11.25 11.25M11.25 2.75L2.75 11.25" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** Thin-stroke chevron, used instead of a text "‹"/"›" glyph. */
function ChevronIcon({ dir, className = "" }: { dir: "prev" | "next"; className?: string }) {
  return (
    <svg viewBox="0 0 6 14" fill="none" className={`h-full w-full ${dir === "prev" ? "rotate-180" : ""} ${className}`}>
      <path d="M1 1L5 7L1 13" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

const RATIO: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};

function Header({ study }: { study: CaseStudy }) {
  const { t, locale } = useLocale();
  const category = getCategory(study.category);

  return (
    <header className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-ink/15 px-6 py-5 md:px-[120px]">
      <h1 className="font-serif text-[clamp(1.4rem,3vw,2.25rem)] font-light uppercase leading-none tracking-[-0.03em]">
        {study.title}
      </h1>
      {study.title.toLowerCase() !== study.client.toLowerCase() && (
        <span className="text-xs uppercase tracking-wide text-ink/50">
          {study.client}
        </span>
      )}
      <span className="text-[11px] tabular-nums text-ink/40">
        [{study.index}]
      </span>
      <span className="text-[11px] uppercase tracking-wide text-ink/60">
        {category ? category.name[locale] : null}
      </span>
      <span className="text-[11px] tabular-nums text-ink/40">
        {yearTag(study.year)}
      </span>
      <Link
        href={`/work/${study.category}`}
        className="ml-auto text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-red"
      >
        {t({ es: "Volver", en: "Back" })}
      </Link>
    </header>
  );
}

function MediaTile({
  item,
  onOpen,
  className = "",
}: {
  item: MediaBlock;
  onOpen: () => void;
  className?: string;
}) {
  const { t } = useLocale();
  const ratio =
    item.type === "image" && item.ratio ? RATIO[item.ratio] : "aspect-[4/3]";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative w-full overflow-hidden bg-mist ${
        item.type === "video" ? "aspect-video" : ratio
      } ${className}`}
      aria-label={t({ es: "Ver en grande", en: "View larger" })}
    >
      {item.type === "video" && item.src && (
        <video
          src={cldOptimize(item.src)}
          muted
          loop
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      )}
      {item.type === "image" && item.src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cldOptimize(item.src)}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
      <span className="pointer-events-none absolute right-3 top-3 text-[11px] text-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
        ⤢
      </span>
    </button>
  );
}

type TextBlock = Extract<CaseBlock, { type: "text" }>;

/** x/1440 or y/900 as a CSS percentage — the canvas below is fixed at that
 * 1440×900 aspect ratio, so left/top/width/height percentages computed this
 * way reproduce Figma's exact pixel layout at any rendered size. */
const PCT = (v: number, total: number) => `${(v / total) * 100}%`;

/** v1 — KISH&GO's exact hero canvas (Figma "Hero", 1440×900, exact CSS
 * supplied 2026-09-03). Every branding case uses this same template — it's
 * the only one currently assigned to `branding` (see the file header
 * comment) — so this single component *is* "every brand has the same
 * design". ‹ › page to the previous/next case in the category, and × closes
 * back to the category, both absolutely positioned like the rest.
 *
 * 8 fixed card slots (`caseMedia`, up to 8 — see work.ts and the admin's
 * V1ContentEditor), each its own distinct photo by position — never
 * repeated. A slot with no photo uploaded yet renders visibly empty
 * (dashed outline) instead of duplicating another slot's image or showing
 * a blank white rectangle.
 *
 * Below `lg` this absolute 1440-wide canvas isn't practical (text would be
 * unreadably small) — `MobileGalleryView` takes over instead with a plain
 * stacked reading order using the same photos and copy.
 */
function GalleryLayout({ study }: { study: CaseStudy }) {
  const { t, locale } = useLocale();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const media = caseMedia(study);
  const at = (i: number) => media[i];

  const texts = study.blocks.filter(
    (b): b is TextBlock => b.type === "text",
  );
  const lead = texts.find((b) => b.variant === "lead") ?? texts[0];
  const body = texts.find((b) => b !== lead);

  const category = getCategory(study.category);
  const siblings = casesByCategory(study.category);
  const pos = siblings.findIndex((c) => c.slug === study.slug);
  const prev = siblings[(pos - 1 + siblings.length) % siblings.length];
  const next = siblings[(pos + 1) % siblings.length];

  const Tile = ({
    idx,
    left,
    top,
    width,
    height,
    flip = false,
    align,
  }: {
    idx: number;
    left: number;
    top: number;
    width: number;
    height: number;
    flip?: boolean;
    /** Crop anchor for object-cover — position 8 (the tall right strip) is
     * narrow enough that a center crop can cut off the subject; pinning it
     * to the image's left edge keeps that instead. */
    align?: "left";
  }) => {
    const item = at(idx);
    const hasContent = Boolean(item?.src);

    if (!hasContent) {
      // Empty slot (no photo uploaded for this position yet) — visibly
      // empty, not an inert blank-white rectangle that reads as broken.
      return (
        <div
          style={{
            left: PCT(left, 1440),
            top: PCT(top, 900),
            width: PCT(width, 1440),
            height: PCT(height, 900),
          }}
          className="absolute overflow-hidden border border-dashed border-ink/15 bg-mist/40"
        />
      );
    }

    return (
      <button
        type="button"
        onClick={() => setLightbox(Math.min(idx, media.length - 1))}
        aria-label={t({ es: "Ver en grande", en: "View larger" })}
        style={{
          left: PCT(left, 1440),
          top: PCT(top, 900),
          width: PCT(width, 1440),
          height: PCT(height, 900),
        }}
        className="group absolute overflow-hidden bg-white"
      >
        {item!.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cldOptimize(item!.src)}
            alt=""
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${align === "left" ? "object-left" : ""} ${flip ? "scale-x-[-1]" : ""}`}
          />
        ) : (
          <video
            src={cldOptimize(item!.src)}
            muted
            loop
            playsInline
            autoPlay
            className={`h-full w-full object-cover ${align === "left" ? "object-left" : ""}`}
          />
        )}
      </button>
    );
  };

  return (
    <article className="-mt-20 bg-cream text-ink md:-mt-[120px]">
      {/* desktop: exact Figma canvas, lg and up only */}
      <div className="relative hidden lg:block" style={{ aspectRatio: "1440 / 900" }}>
        <h1
          style={{ left: PCT(88, 1440), top: PCT(142, 900), width: PCT(200, 1440) }}
          className="absolute font-serif text-[clamp(1rem,1.7vw,1.5rem)] font-light leading-[1.2] tracking-[-0.06em] text-ink"
        >
          {study.title}
        </h1>
        <span
          style={{ left: PCT(335, 1440), top: PCT(151, 900) }}
          className="absolute whitespace-nowrap text-[clamp(0.65rem,0.85vw,0.75rem)] font-extralight tracking-[-0.06em] tabular-nums text-ink"
        >
          [{parseInt(study.index, 10)}]
        </span>
        <span
          style={{ left: PCT(406, 1440), top: PCT(151, 900) }}
          className="absolute whitespace-nowrap text-[clamp(0.65rem,0.85vw,0.75rem)] font-extralight uppercase tracking-[-0.06em] text-ink"
        >
          {category ? category.name[locale] : null}
        </span>
        <span
          style={{ left: PCT(1243, 1440), top: PCT(151, 900), width: PCT(17, 1440) }}
          className="absolute text-[clamp(0.65rem,0.85vw,0.75rem)] font-extralight leading-[1.2] tracking-[-0.06em] tabular-nums text-ink"
        >
          {yearTag(study.year).split(" ").map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </span>
        <Link
          href={`/work/${study.category}`}
          aria-label={t({ es: "Cerrar", en: "Close" })}
          style={{
            left: PCT(1336, 1440),
            top: PCT(151, 900),
            width: PCT(14, 1440),
            height: PCT(14, 900),
          }}
          className="absolute text-ink transition-colors hover:text-red"
        >
          <CloseIcon />
        </Link>

        {lead && (
          <p
            style={{ left: PCT(686, 1440), top: PCT(267, 900), width: PCT(379, 1440) }}
            className="absolute text-[clamp(0.75rem,0.97vw,0.875rem)] font-extralight leading-[1.2] tracking-[-0.05em] text-ink"
          >
            {lead.content[locale]}
          </p>
        )}
        {body && (
          <p
            style={{ left: PCT(89, 1440), top: PCT(621, 900), width: PCT(379, 1440) }}
            className="absolute text-[clamp(0.75rem,0.97vw,0.875rem)] font-extralight leading-[1.2] tracking-[-0.05em] text-ink"
          >
            {body.content[locale]}
          </p>
        )}

        {/* Order = upload position 1-8 exactly, per the numbered reference:
            1/2 the small top pair, 3 the big hero, 4/5 the small mid pair,
            6/7 the stacked pair, 8 the tall right strip. */}
        <Tile idx={0} left={686} top={151} width={137} height={81} />
        <Tile idx={1} left={832} top={151} width={137} height={81} />
        <Tile idx={2} left={89} top={269} width={526} height={296} />
        <Tile idx={3} left={686} top={433} width={137} height={89} />
        <Tile idx={4} left={832} top={433} width={137} height={89} />
        <Tile idx={5} left={978} top={531} width={178} height={124} />
        <Tile idx={6} left={978} top={664} width={178} height={124} />
        <Tile idx={7} left={1291} top={269} width={149} height={434} align="left" />

        <Link
          href={`/work/${prev.category}/${prev.slug}`}
          aria-label={t({ es: "Anterior", en: "Previous" })}
          style={{
            left: PCT(191, 1440),
            top: PCT(785, 900),
            width: PCT(6, 1440),
            height: PCT(14, 900),
          }}
          className="absolute text-ink transition-colors hover:text-red"
        >
          <ChevronIcon dir="prev" />
        </Link>
        <Link
          href={`/work/${next.category}/${next.slug}`}
          aria-label={t({ es: "Siguiente", en: "Next" })}
          style={{
            left: PCT(1254, 1440),
            top: PCT(785, 900),
            width: PCT(6, 1440),
            height: PCT(14, 900),
          }}
          className="absolute text-ink transition-colors hover:text-red"
        >
          <ChevronIcon dir="next" />
        </Link>
      </div>

      {/* mobile/tablet: plain stacked reading order, below lg */}
      <MobileGalleryView
        study={study}
        media={media}
        lead={lead}
        body={body}
        prev={prev}
        next={next}
        onOpen={setLightbox}
      />

      <Lightbox
        media={media}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={setLightbox}
      />
    </article>
  );
}

function MobileGalleryView({
  study,
  media,
  lead,
  body,
  prev,
  next,
  onOpen,
}: {
  study: CaseStudy;
  media: MediaBlock[];
  lead?: TextBlock;
  body?: TextBlock;
  prev: CaseStudy;
  next: CaseStudy;
  onOpen: (i: number) => void;
}) {
  const { t, locale } = useLocale();
  const category = getCategory(study.category);

  return (
    <div className="pb-16 pt-20 lg:hidden">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-6">
        <h1 className="font-serif text-2xl font-light leading-[1.2] tracking-[-0.06em] text-ink">
          {study.title}
        </h1>
        <span className="text-xs font-extralight tracking-[-0.06em] tabular-nums text-ink">
          [{parseInt(study.index, 10)}]
        </span>
        <span className="text-xs font-extralight uppercase tracking-[-0.06em] text-ink">
          {category ? category.name[locale] : null}
        </span>
        <span className="text-xs font-extralight tracking-[-0.06em] tabular-nums text-ink">
          {yearTag(study.year)}
        </span>
        <Link
          href={`/work/${study.category}`}
          aria-label={t({ es: "Cerrar", en: "Close" })}
          className="ml-auto h-4 w-4 text-ink transition-colors hover:text-red"
        >
          <CloseIcon />
        </Link>
      </header>

      <div className="mt-8 flex flex-col gap-8 px-6">
        {lead && (
          <p className="text-base font-extralight leading-relaxed tracking-[-0.05em] text-ink">
            {lead.content[locale]}
          </p>
        )}
        {media[0] && (
          <button
            type="button"
            onClick={() => onOpen(0)}
            className="relative block aspect-[4/3] w-full overflow-hidden bg-white"
          >
            {media[0].type === "image" && media[0].src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cldOptimize(media[0].src)} alt="" className="h-full w-full object-cover" />
            )}
          </button>
        )}
        {body && (
          <p className="text-base font-extralight leading-relaxed tracking-[-0.05em] text-ink">
            {body.content[locale]}
          </p>
        )}
        {media.slice(1).map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onOpen(i + 1)}
            className="relative block aspect-[4/3] w-full overflow-hidden bg-white"
          >
            {item.type === "image" && item.src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cldOptimize(item.src)} alt="" className="h-full w-full object-cover" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-6 px-6 text-lg">
        <Link
          href={`/work/${prev.category}/${prev.slug}`}
          aria-label={t({ es: "Anterior", en: "Previous" })}
          className="h-3.5 w-2 text-ink transition-colors hover:text-red"
        >
          <ChevronIcon dir="prev" />
        </Link>
        <Link
          href={`/work/${next.category}/${next.slug}`}
          aria-label={t({ es: "Siguiente", en: "Next" })}
          className="h-3.5 w-2 text-ink transition-colors hover:text-red"
        >
          <ChevronIcon dir="next" />
        </Link>
      </div>
    </div>
  );
}

/** v2 / v3 — static page: 1 or 2 text columns beside one big hero media,
 * optionally followed by a smaller media row (v2 only). */
function StaticLayoutView({ study }: { study: CaseStudy }) {
  const { locale } = useLocale();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const media = caseMedia(study);
  const layout = study.layout!;

  return (
    <article className="-mt-20 bg-cream pb-16 pt-20 text-ink md:-mt-[120px] md:pt-[120px]">
      <Header study={study} />

      <div
        className={`grid gap-10 px-6 py-10 md:px-[120px] md:py-14 ${
          layout.columns.length > 1
            ? "md:grid-cols-[1fr_1fr_1.3fr]"
            : "md:grid-cols-[1fr_1.4fr]"
        }`}
      >
        {layout.columns.map((col, ci) => (
          <div key={ci} className="space-y-5">
            {col.map((p, pi) => (
              <p
                key={pi}
                className={
                  p.emphasis
                    ? "font-serif text-base leading-relaxed text-red md:text-lg"
                    : "text-sm font-light leading-relaxed text-ink/80"
                }
              >
                {p.content[locale]}
              </p>
            ))}
          </div>
        ))}

        <MediaTile
          item={layout.media}
          onOpen={() => setLightbox(0)}
          className="h-full min-h-[280px] md:row-span-1"
        />
      </div>

      {layout.secondaryMedia && layout.secondaryMedia.length > 0 && (
        <div className="grid grid-cols-2 gap-6 px-6 md:px-[120px]">
          {layout.secondaryMedia.map((m, i) => (
            <MediaTile
              key={i}
              item={m}
              onOpen={() => setLightbox(i + 1)}
              className="aspect-[4/3]"
            />
          ))}
        </div>
      )}

      <Lightbox
        media={media}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={setLightbox}
      />
    </article>
  );
}

export default function CaseStudyView({ study }: { study: CaseStudy }) {
  return study.layout ? (
    <StaticLayoutView study={study} />
  ) : (
    <GalleryLayout study={study} />
  );
}

export type { CaseBlock };
