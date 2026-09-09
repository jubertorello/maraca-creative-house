"use client";

import Image from "next/image";
import MediaHero from "@/components/MediaHero";
import { CLIENTS, type Client } from "@/lib/clients";
import { useLocale } from "@/lib/i18n";
import type { AboutContent } from "@/lib/site-content";

/** Figma "About us" (6019:38). Text editable from /admin/about. */

const FALLBACK: AboutContent = {
  heroVideo: { desktop: "/media/about-hero.mp4" },
  blocks: [
    {
      title: {
        es: "Nos mueve la curiosidad. Nos obsesionan los detalles.",
        en: "Curiosity moves us. Details obsess us.",
      },
      body: {
        es: "Somos una agencia creativa boutique especializada en construir marcas con estrategia, criterio estético e ideas capaces de vivir en cualquier formato.",
        en: "We're a boutique creative agency focused on building brands with strategy, aesthetic judgement and ideas able to live in any format.",
      },
      bodyStyle: "italic",
    },
    {
      title: { es: "Construimos universos de marca.", en: "We build brand universes." },
      body: {
        es: "A veces, ese universo empieza con una identidad visual, estrategia de comunicación, campaña de publicidad, evento, web o shooting. Nos adaptamos a lo que cada proyecto necesita porque entendemos que las mejores ideas no caben dentro de un departamento.",
        en: "Sometimes that universe starts with a visual identity, a communication strategy, an ad campaign, an event, a website or a shooting. We adapt to what each project needs, because the best ideas don't fit inside a single department.",
      },
      bodyStyle: "caps",
    },
    {
      title: { es: "Trabajamos como partners creativos.", en: "We work as creative partners." },
      body: {
        es: "Cada decisión responde a una estrategia. Cada imagen tiene una intención. Cada concepto nace de un insight y cada buena idea se proyecta en un buen diseño.",
        en: "Every decision answers to a strategy. Every image has an intention. Every concept is born from an insight, and every good idea shows in good design.",
      },
      bodyStyle: "caps",
    },
  ],
  logosTitle: {
    es: "Marcas que nos han dejado darle una vuelta",
    en: "Brands that have let us look at things twice",
  },
};

export default function AboutPageClient({
  content = FALLBACK,
  clients = CLIENTS,
}: {
  content?: AboutContent;
  clients?: Client[];
}) {
  const { t } = useLocale();

  return (
    <>
      {/* Figma "About us" > Hero — dark video */}
      <MediaHero kind="video" className="bg-charcoal" video={content.heroVideo} />

      {/* Figma "About us" > Quiénes somos (6019:50) */}
      <section className="space-y-20 bg-charcoal px-6 py-24 text-center text-cream md:px-[120px] md:py-32">
        {content.blocks.map((b, i) => (
          <div key={i} className="mx-auto max-w-[760px]">
            {/* Georgia Pro Light 44px / -6% / 120% */}
            <h2 className="font-serif text-[clamp(1.75rem,3.06vw,2.75rem)] font-light uppercase leading-[1.2] tracking-[-0.06em]">
              {t(b.title)}
            </h2>
            {b.bodyStyle === "italic" ? (
              // Georgia Pro Light Italic 30px / -5% / 120%
              <p className="mx-auto mt-6 max-w-[640px] font-serif text-[clamp(1.15rem,2.08vw,1.875rem)] font-light italic leading-[1.2] tracking-[-0.05em] text-cream">
                {t(b.body)}
              </p>
            ) : (
              // Bricolage ExtraLight 16px / -5% / 120% / uppercase
              <p className="mx-auto mt-6 max-w-[540px] text-[clamp(0.8rem,1.11vw,1rem)] font-extralight uppercase leading-[1.2] tracking-[-0.05em] text-cream">
                {t(b.body)}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* Figma "About us" > logos (6081:450): a real 5-column grid, every
          cell the same size — logos where we have a file, a wordmark
          fallback otherwise. Grows however many clients the CMS sends. */}
      <section className="bg-cream px-6 py-24 md:px-[120px]">
        <h2 className="mx-auto max-w-[760px] text-center font-serif text-[clamp(1.5rem,3.4vw,2.5rem)] font-light uppercase leading-[1.2] tracking-[-0.04em] text-ink">
          {t(content.logosTitle)}
        </h2>
        <ul className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-3 md:grid-cols-5">
          {clients.map((c) => (
            <li
              key={c.slug}
              className="flex aspect-[3/2] items-center justify-center"
            >
              {c.logoUrl ? (
                <Image
                  src={c.logoUrl}
                  alt={c.name}
                  width={200}
                  height={48}
                  className="h-10 w-auto max-w-full object-contain opacity-80 transition-opacity hover:opacity-100 md:h-12"
                />
              ) : (
                <span className="text-center text-sm font-light uppercase tracking-wide text-ink/60">
                  {c.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
