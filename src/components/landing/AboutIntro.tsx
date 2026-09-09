"use client";

import { Fragment } from "react";
import { useLocale } from "@/lib/i18n";
import { parseEmphasis, type Lang } from "@/lib/site-content";

/**
 * "Quiénes somos" — Figma "Landing entera" > Quiénes somos (5:9), 1440×726,
 * bg #EBEDDE. Text node (8:4): Georgia Pro Light 44px, 120% line-height,
 * left-aligned (ragged right — NOT justified), width 1263, x 87 / y 71.
 * "creative house" / "partner creativo" set in red italic.
 *
 * Text is editable from /admin/content (Home) — `*word or phrase*` in that
 * field marks the red-italic emphasis, parsed by parseEmphasis.
 */

const FALLBACK: Lang = {
  es: "Somos de darle una vuelta a las cosas. A veces dos. Porque hacer más ruido no siempre significa hacerse escuchar. Somos una *creative house* y *partner creativo* para marcas que quieren ir un poco más allá. Pensamos, creamos y damos forma a ideas que pueden convertirse en una identidad, una campaña, una experiencia, una web, un evento o, si hace falta, algo que todavía no sabemos cómo llamar. No nos interesa hacer por hacer. Ni dar por bueno lo que siempre se ha hecho así. Nos gusta encontrar el porqué. El insight. El concepto. La forma. Y llevarlo hasta el último detalle.",
  en: "We like to look at things twice. Sometimes three times. Because making more noise doesn't always mean being heard. We're a *creative house* and *creative partner* for brands that want to go a little further. We think, create and shape ideas that can become an identity, a campaign, an experience, a website, an event or, if needed, something we don't have a name for yet. We're not interested in doing things just to do them, or settling for the way it's always been done. We like finding the why. The insight. The concept. The form. And taking it down to the last detail.",
};

export default function AboutIntro({ text = FALLBACK }: { text?: Lang }) {
  const { locale } = useLocale();
  const chunks = parseEmphasis(text[locale]);

  return (
    <section className="bg-cream px-[6vw] py-[clamp(2.5rem,5vw,72px)] xl:px-0">
      <p className="mx-auto max-w-[1263px] text-left font-serif text-[clamp(1.45rem,2.95vw,2.65rem)] font-light uppercase leading-[1.2] tracking-[-0.045em] text-ink">
        {chunks.map((chunk, i) =>
          chunk.emphasis ? (
            <em key={i} className="italic text-red">
              {chunk.text}
            </em>
          ) : (
            <Fragment key={i}>{chunk.text}</Fragment>
          ),
        )}
      </p>
    </section>
  );
}
