"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import Lightbox from "@/components/Lightbox";
import {
  getCategory,
  caseMedia,
  yearTag,
  type CaseStudy,
  type CaseBlock,
  type MediaBlock,
} from "@/lib/work";

/**
 * Case study — 3 publishing layouts, chosen per client in the future CMS:
 *   v1 = KISH&GO (6053:59)   — horizontal-scroll gallery, short text.
 *   v2 = Natuka  (6100:1281) — 2 text columns + 1 big video + a 2-image row.
 *   v3 = VB Group(6109:25)   — 1 text column + 1 big video.
 * Header row (title · index · category · year · ×) is shared by all three.
 */
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
        aria-label={t({ es: "Cerrar", en: "Close" })}
        className="ml-auto text-xl leading-none text-ink/50 transition-colors hover:text-red"
      >
        ×
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
          src={item.src}
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
          src={item.src}
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

/** v1 — KISH&GO-style fixed-height horizontal-scroll gallery. */
function GalleryLayout({ study }: { study: CaseStudy }) {
  const { t, locale } = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const media = caseMedia(study);
  let mediaCursor = -1;

  function page(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <article className="-mt-20 flex h-[100svh] flex-col bg-cream pt-20 text-ink md:-mt-[120px] md:pt-[120px]">
      <Header study={study} />

      <div
        ref={trackRef}
        className="flex flex-1 snap-x snap-mandatory items-center gap-8 overflow-x-auto scroll-smooth px-6 py-8 md:gap-12 md:px-[120px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {study.blocks.map((block, i) => {
          if (block.type === "text") {
            return (
              <div key={i} className="w-[78vw] shrink-0 snap-start sm:w-[420px]">
                <p
                  className={
                    block.variant === "lead"
                      ? "font-serif text-[clamp(1.05rem,1.6vw,1.4rem)] font-light leading-[1.35]"
                      : "text-sm font-light leading-relaxed text-ink/75"
                  }
                >
                  {block.content[locale]}
                </p>
              </div>
            );
          }
          mediaCursor += 1;
          const mi = mediaCursor;
          return (
            <MediaTile
              key={i}
              item={block}
              onOpen={() => setLightbox(mi)}
              className="h-[62vh] w-auto shrink-0 snap-start"
            />
          );
        })}
      </div>

      <div className="flex items-center gap-6 border-t border-ink/15 px-6 py-4 text-lg md:px-[120px]">
        <button
          onClick={() => page(-1)}
          aria-label={t({ es: "Anterior", en: "Previous" })}
          className="text-ink/50 transition-colors hover:text-red"
        >
          ‹
        </button>
        <button
          onClick={() => page(1)}
          aria-label={t({ es: "Siguiente", en: "Next" })}
          className="text-ink/50 transition-colors hover:text-red"
        >
          ›
        </button>
        <Link
          href={`/work/${study.category}`}
          className="ml-auto text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-red"
        >
          {t({ es: "Volver", en: "Back" })}
        </Link>
      </div>

      <Lightbox
        media={media}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={setLightbox}
      />
    </article>
  );
}

/** v2 / v3 — static page: 1 or 2 text columns beside one big hero media,
 * optionally followed by a smaller media row (v2 only). */
function StaticLayoutView({ study }: { study: CaseStudy }) {
  const { t, locale } = useLocale();
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

      <div className="mt-10 flex items-center px-6 md:px-[120px]">
        <Link
          href={`/work/${study.category}`}
          className="text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-red"
        >
          {t({ es: "Volver", en: "Back" })}
        </Link>
      </div>

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
