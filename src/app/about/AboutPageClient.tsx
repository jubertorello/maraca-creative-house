"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
        es: "Nos mueve la curiosidad.\nNos obsesionan los detalles.",
        en: "Curiosity moves us.\nDetails obsess us.",
      },
      body: {
        es: "Somos una agencia creativa boutique especializada en construir marcas con estrategia, criterio estético e ideas capaces de vivir en cualquier formato.",
        en: "We're a boutique creative agency focused on building brands with strategy, aesthetic judgement and ideas able to live in any format.",
      },
      bodyStyle: "italic",
    },
    {
      title: { es: "Construimos\nuniversos de marca.", en: "We build\nbrand universes." },
      body: {
        es: "A veces, ese universo empieza con una identidad visual, estrategia de comunicación, campaña de publicidad, evento, web o shooting. Nos adaptamos a lo que cada proyecto necesita porque entendemos que las mejores ideas no caben dentro de un departamento.",
        en: "Sometimes that universe starts with a visual identity, a communication strategy, an ad campaign, an event, a website or a shooting. We adapt to what each project needs, because the best ideas don't fit inside a single department.",
      },
      bodyStyle: "caps",
    },
    {
      title: {
        es: "Trabajamos como\npartners creativos.",
        en: "We work as\ncreative partners.",
      },
      body: {
        es: "Cada decisión responde a una estrategia. Cada imagen tiene una intención. Cada concepto nace de un insight y cada buena idea se proyecta en un buen diseño.",
        en: "Every decision answers to a strategy. Every image has an intention. Every concept is born from an insight, and every good idea shows in good design.",
      },
      bodyStyle: "caps",
    },
  ],
  logosTitle: {
    es: "Marcas que nos han dejado\ndarle una vuelta.",
    en: "Brands that have let us\nlook at things twice.",
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

  // Logos fade/rise in once, staggered by grid position, the first time the
  // grid scrolls into view — not per-item observers (30+ of those for one
  // effect is wasteful), just one watching the grid itself.
  const gridRef = useRef<HTMLUListElement>(null);
  const [logosRevealed, setLogosRevealed] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLogosRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Figma "About us" > Hero — dark video */}
      <MediaHero kind="video" className="bg-charcoal" video={content.heroVideo} />

      {/* Figma "About us" > Quiénes somos (6019:50). -mt-px seals the seam
          against the hero above — see the equivalent fix in
          TeamPageClient.tsx for why. */}
      <section className="-mt-px space-y-20 bg-charcoal px-6 py-24 text-center text-cream md:px-[120px] md:py-32">
        {content.blocks.map((b, i) => (
          <div key={i} className="mx-auto max-w-[760px]">
            {/* Georgia Pro Light 44px / -6% / 120%. Line breaks are literal
                `\n`s in the stored text (typed as separate lines in the
                admin) so the title can match Figma's exact line lengths
                instead of reflowing purely by container width. */}
            <h2 className="font-serif text-[clamp(1.75rem,3.06vw,2.75rem)] font-light uppercase leading-[1.2] tracking-[-0.06em]">
              {t(b.title)
                .split("\n")
                .map((line, li) => (
                  <span key={li} className="block">
                    {line}
                  </span>
                ))}
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
          {t(content.logosTitle)
            .split("\n")
            .map((line, li) => (
              <span key={li} className="block">
                {line}
              </span>
            ))}
        </h2>
        <ul
          ref={gridRef}
          className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-3 md:grid-cols-5"
        >
          {clients.map((c, i) => (
            <li
              key={c.slug}
              style={{ transitionDelay: logosRevealed ? `${Math.min(i * 30, 600)}ms` : "0ms" }}
              className={`flex aspect-[3/2] items-center justify-center transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
                logosRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {c.logoUrl ? (
                <Image
                  src={c.logoUrl}
                  alt={c.name}
                  width={200}
                  height={64}
                  // Each cell (aspect-[3/2]) has more like ~110px of real
                  // height on a typical 5-col row, so a fixed h-14/h-16
                  // undersold compact/near-square logos — but height alone
                  // isn't enough: a wide wordmark (e.g. baïa, ratio ~2.5)
                  // and a squarish lockup (e.g. Volver a Casa, ratio ~1.5)
                  // hit the SAME fixed height very differently wide, which
                  // is exactly what read as "one is double the size of the
                  // other". Capping width too (object-contain then binds on
                  // whichever of the two is tighter for that logo) keeps
                  // every logo's footprint in the same ballpark regardless
                  // of its own aspect ratio — same fix as the Home marquee.
                  className="h-auto max-h-14 w-auto max-w-[120px] object-contain md:max-h-16 md:max-w-[150px]"
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
