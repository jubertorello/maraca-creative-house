"use client";

import { useLocale } from "@/lib/i18n";
import type { Category } from "@/lib/work";

/**
 * "Estrategia" — Figma "Work estrategia I" (6116:69), adapted to lead with
 * the brand video: title, description, video, closing line — the
 * description overlaps the top of the video and the closing line overlaps
 * its bottom. No client here gets its own page.
 */
export default function StrategyView({ category }: { category: Category }) {
  const { t, locale } = useLocale();

  return (
    <article className="-mt-20 bg-charcoal pb-24 pt-32 text-cream md:-mt-[120px] md:pt-40">
      <header className="px-6 text-center md:px-[120px]">
        <h1 className="mx-auto max-w-3xl font-serif text-[clamp(1.75rem,4.2vw,3rem)] font-light uppercase leading-[1.15] tracking-[-0.03em]">
          {t({
            es: "Hablar es fácil. Tener algo que decir, no tanto.",
            en: "Talking is easy. Having something to say, not so much.",
          })}
        </h1>
      </header>

      <div className="relative mt-14 px-4 md:px-8">
        {/* description — overlaps the top edge of the video */}
        <p className="relative z-10 mx-auto -mb-10 max-w-xl text-center font-serif text-lg italic leading-relaxed text-cream [text-shadow:0_2px_16px_rgba(0,0,0,0.85)] md:-mb-14 md:text-xl">
          {t({
            es: "En Maraca construimos la estrategia que hay detrás de cada conversación: definimos a quién hablamos, qué queremos contar, cómo queremos sonar y dónde tiene sentido hacerlo.",
            en: "At Maraca we build the strategy behind every conversation: who we're talking to, what we want to say, how we want to sound and where it makes sense to do it.",
          })}
        </p>

        <video
          className="relative aspect-video w-full bg-black object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/media/estrategia.mp4" type="video/mp4" />
        </video>

        {/* closing line — sits below the video, just grazing its bottom edge */}
        <p className="relative z-10 mx-auto -mt-4 max-w-xl text-center font-serif text-lg italic leading-relaxed text-cream [text-shadow:0_2px_16px_rgba(0,0,0,0.85)] md:-mt-6 md:text-xl">
          {t({
            es: "Para que la marca no solo esté presente, sino que tenga una voz propia y sepa cuándo usarla.",
            en: "So the brand isn't just present, but has a voice of its own and knows when to use it.",
          })}
        </p>
      </div>
    </article>
  );
}
