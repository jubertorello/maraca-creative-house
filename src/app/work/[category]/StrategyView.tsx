"use client";

import MediaHero from "@/components/MediaHero";
import { useLocale } from "@/lib/i18n";
import type { Category } from "@/lib/work";

/**
 * "Estrategia" — Figma "Work estrategia I" (6116:69). Unlike the other
 * categories this is a single manifesto page for the whole service: hero
 * video, headline + intro, a fanned collage of the strategy deliverables,
 * and a closing line. No client here gets its own page.
 */
const DECK = [
  { label: { es: "Brand Narrative", en: "Brand Narrative" }, rotate: -8 },
  { label: { es: "Personalidad", en: "Personality" }, rotate: -4 },
  { label: { es: "Tono", en: "Tone of voice" }, rotate: 0 },
  { label: { es: "Pilares", en: "Pillars" }, rotate: 4 },
  { label: { es: "Canales", en: "Channels" }, rotate: 8 },
];

export default function StrategyView({ category }: { category: Category }) {
  const { t, locale } = useLocale();

  return (
    <article className="bg-charcoal text-cream">
      <MediaHero kind="video" src="/media/estrategia.mp4" className="bg-charcoal" />

      <section className="px-6 pb-24 pt-20 text-center md:px-[120px] md:pt-28">
        <span className="mb-6 block text-xs tabular-nums text-cream/40">
          [{category.index}]
        </span>
        <h1 className="mx-auto max-w-3xl font-serif text-[clamp(1.75rem,4.2vw,3rem)] font-light uppercase leading-[1.15] tracking-[-0.03em]">
          {t({
            es: "Hablar es fácil. Tener algo que decir, no tanto.",
            en: "Talking is easy. Having something to say, not so much.",
          })}
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-serif text-lg italic leading-relaxed text-cream/80">
          {t({
            es: "En Maraca construimos la estrategia que hay detrás de cada conversación: definimos a quién hablamos, qué queremos contar, cómo queremos sonar y dónde tiene sentido hacerlo.",
            en: "At Maraca we build the strategy behind every conversation: who we're talking to, what we want to say, how we want to sound and where it makes sense to do it.",
          })}
        </p>

        {/* fanned deck of strategy deliverables — placeholder cards until
            the real deck photography/mockups are supplied */}
        <div className="mx-auto mt-20 flex max-w-4xl justify-center">
          {DECK.map((d, i) => (
            <div
              key={i}
              style={{
                transform: `rotate(${d.rotate}deg)`,
                marginLeft: i === 0 ? 0 : "-2.5rem",
              }}
              className="relative flex aspect-[3/4] w-32 shrink-0 items-end justify-center overflow-hidden rounded-sm bg-cream/10 pb-3 shadow-lg shadow-black/30 transition-transform duration-300 hover:-translate-y-2 md:w-40"
            >
              <span className="text-[10px] uppercase tracking-wide text-cream/70">
                {d.label[locale]}
              </span>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-20 max-w-xl font-serif text-lg italic leading-relaxed text-cream/80">
          {t({
            es: "Para que la marca no solo esté presente, sino que tenga una voz propia y sepa cuándo usarla.",
            en: "So the brand isn't just present, but has a voice of its own and knows when to use it.",
          })}
        </p>
      </section>
    </article>
  );
}
