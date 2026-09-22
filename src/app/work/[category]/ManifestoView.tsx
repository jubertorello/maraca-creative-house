"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import type { Category, ManifestoContent } from "@/lib/work";
import ResponsiveVideoSources from "@/components/ResponsiveVideoSources";

const FALLBACK: ManifestoContent = {
  heroVideo: {
    desktop: "https://res.cloudinary.com/klrhikvq/video/upload/v1788791411/maraca/media/estrategia.mov",
  },
  titleLine1: { es: "Hablar es fácil.", en: "Talking is easy." },
  titleLine2: {
    es: "Tener algo que decir, no tanto.",
    en: "Having something to say, not so much.",
  },
  description: {
    es: "En Maraca construimos la estrategia que hay detrás de cada conversación:\ndefinimos a quién hablamos, qué queremos contar, cómo queremos sonar y\ndónde tiene sentido hacerlo.",
    en: "At Maraca we build the strategy behind every conversation:\nwho we're talking to, what we want to say, how we want to sound and\nwhere it makes sense to do it.",
  },
  closingLine: {
    es: "Para que la marca no solo esté presente, sino que tenga una voz propia y sepa cuándo usarla.",
    en: "So the brand isn't just present, but has a voice of its own and knows when to use it.",
  },
};

/**
 * Page for any `kind: "manifesto"` category — Estrategia (Figma "Work
 * estrategia I", 6116:69) is the design source: title, description, boxed
 * video, closing line, no per-client cases. Editable from
 * /admin/work/[category]. See also `VideoOnlyView` for `kind: "video"`,
 * the same idea but without any text.
 */
export default function ManifestoView({
  category,
  content = FALLBACK,
}: {
  category: Category;
  content?: ManifestoContent;
}) {
  const { t } = useLocale();

  return (
    <article className="-mt-20 bg-charcoal pb-24 pt-24 text-cream md:-mt-[120px] md:pt-28">
      <header className="px-6 text-center md:px-[120px]">
        <div className="mb-3 flex justify-end md:mb-4">
          <Link
            href="/work"
            className="text-xs uppercase tracking-widest text-cream/50 transition-colors hover:text-red"
          >
            {t({ es: "Volver", en: "Back" })}
          </Link>
        </div>
        <h1 className="mx-auto max-w-3xl font-serif text-[clamp(1.75rem,3.06vw,2.75rem)] font-light uppercase leading-[1.2] tracking-[-0.06em]">
          <span className="block">{t(content.titleLine1)}</span>
          <span className="block">{t(content.titleLine2)}</span>
        </h1>
      </header>

      <div className="relative mt-14 px-4 md:px-8">
        {/* description — overlaps the top edge of the video. The overlap is a
            fixed px amount but the video's height (aspect-video) shrinks a
            lot on narrow screens, so it's kept small at mobile widths and
            only grows to the tuned desktop amount from `md` up. Line breaks
            are literal `\n`s in the stored text (see ManifestoContent) —
            the design sets this in a fixed number of lines, not
            flowing/reflowing text. */}
        <p className="relative z-10 mx-auto -mb-4 max-w-4xl text-center font-serif text-[clamp(1rem,2.08vw,1.875rem)] italic leading-[1.2] tracking-[-0.05em] text-cream [text-shadow:0_2px_16px_rgba(0,0,0,0.85)] md:-mb-14">
          {t(content.description)
            .split("\n")
            .map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
        </p>

        <video
          className="relative aspect-video w-full bg-black object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <ResponsiveVideoSources video={content.heroVideo} />
        </video>

        {/* closing line — sits below the video, just grazing its bottom edge */}
        <p className="relative z-10 mx-auto mt-6 max-w-xl text-center font-serif text-[clamp(1rem,2.08vw,1.875rem)] italic leading-[1.2] tracking-[-0.05em] text-cream [text-shadow:0_2px_16px_rgba(0,0,0,0.85)] md:-mt-6">
          {t(content.closingLine)}
        </p>
      </div>
    </article>
  );
}
