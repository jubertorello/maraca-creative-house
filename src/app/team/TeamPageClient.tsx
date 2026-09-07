"use client";

import Image from "next/image";
import MediaHero from "@/components/MediaHero";
import { TEAM } from "@/lib/team";
import { useLocale } from "@/lib/i18n";

// Figma "Equipo" > Participadas (6049:575): rows of 4 + 3, photos ~216×178,
// role + name in cream below.
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function TeamPageClient() {
  const { t, locale } = useLocale();

  return (
    <>
      {/* Figma "Equipo" > Hero (6068:377) — team montage on #B8CCE0 */}
      <MediaHero
        kind="video"
        alt="El equipo de MARACA"
        className="bg-sky"
        src="/media/team-hero.mp4"
      />

      {/* Figma "Equipo" > Participadas (6049:575) */}
      <section className="bg-charcoal px-6 py-20 text-cream md:px-[80px] md:py-28">
        <h1 className="text-center font-serif text-[clamp(1.6rem,3.4vw,2.5rem)] font-light uppercase leading-[1.2] tracking-[-0.04em]">
          Many minds,
          <br />
          one creative house
        </h1>

        <div className="mx-auto mt-16 flex max-w-[1054px] flex-col items-center gap-y-14">
          {chunk(TEAM, 4).map((row, ri) => (
            <ul
              key={ri}
              className={`flex w-full flex-wrap gap-x-[clamp(1.5rem,4vw,63px)] gap-y-12 ${
                // An incomplete row (fewer than the full row size) starts
                // from the left instead of centering the leftover members.
                row.length < 4 ? "justify-start" : "justify-center"
              }`}
            >
              {row.map((m) => (
                <li
                  key={m.slug}
                  className="w-[clamp(140px,40vw,216px)] text-center"
                >
                  <div className="relative aspect-[216/178] w-full overflow-hidden bg-cream/10 grayscale">
                    {m.photo && (
                      <Image
                        src={`/media/team/${m.slug}.jpg`}
                        alt={m.name}
                        fill
                        sizes="216px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="mt-4 text-[10px] font-extralight uppercase leading-[1.2] tracking-[-0.06em] text-cream/80">
                    [{m.role[locale]}]
                  </p>
                  <p className="mt-1 font-serif text-[16px] font-light uppercase leading-[1.2] tracking-[-0.04em]">
                    <span className="block">{m.name.split(" ")[0]}</span>
                    <span className="block">
                      {m.name.split(" ").slice(1).join(" ")}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* Figma "Equipo" > Quiénes somos (6068:388) — join us */}
      <section className="bg-charcoal px-6 pb-28 text-center text-cream md:px-[120px]">
        <h2 className="mx-auto max-w-3xl font-serif text-[clamp(1.5rem,3.06vw,2.75rem)] uppercase leading-[1.2] tracking-[-0.06em]">
          {t({
            es: "Nos gusta rodearnos de gente que ve las cosas de otra manera.",
            en: "We like surrounding ourselves with people who see things differently.",
          })}
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-[clamp(0.8rem,0.97vw,0.875rem)] font-extralight leading-[1.2] tracking-[-0.05em] text-cream">
          {t({
            es: "Buscamos curiosidad, criterio y ganas de hacer cosas que merezcan la pena. Si tienes algo que enseñar, una idea que contar o simplemente crees que podríamos hacer buenas cosas juntos, queremos conocerte.",
            en: "We look for curiosity, judgement and the drive to make things worth making. If you have something to show, an idea to tell or you just think we could do good things together, we'd like to meet you.",
          })}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-[clamp(0.8rem,0.97vw,0.875rem)] font-extralight uppercase leading-[1.2] tracking-[-0.05em] text-cream">
          {t({
            es: "Mándanos tu portfolio o CV. Quién sabe qué puede salir de aquí.",
            en: "Send us your portfolio or CV. Who knows what could come of it.",
          })}
        </p>
        <a
          href="mailto:hello@lamaraca.com"
          className="mt-10 inline-block font-serif text-[clamp(1.5rem,3.06vw,2.75rem)] tracking-[-0.06em] transition-colors hover:text-red"
        >
          hello@lamaraca.com
        </a>
      </section>
    </>
  );
}
