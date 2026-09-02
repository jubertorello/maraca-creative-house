"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";

/**
 * "Recent Work" — Figma "Landing entera" > Hero #2 (6044:285), bg #1A1A1B.
 * Oversized "RECENT / WORK" display type over a full-bleed showreel video.
 * The whole section links through to /work.
 * Video: /public/media/recent-work.mp4.
 */
export default function RecentWork() {
  const { t } = useLocale();

  return (
    <section className="relative bg-charcoal text-cream">
      <Link href="/work" className="group block">
        <div className="relative h-[92svh] min-h-[520px] w-full overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-90"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/media/recent-work.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-charcoal/45" />

          <h2 className="pointer-events-none absolute inset-0 flex flex-col justify-center px-6 text-[clamp(3.25rem,13vw,11rem)] font-light leading-[0.88] tracking-tight text-cream md:px-[120px]">
            <span className="block">Recent</span>
            <span className="block text-right">Work</span>
          </h2>

          <span className="absolute bottom-8 left-6 border-b border-cream pb-1 text-sm uppercase tracking-widest transition-colors group-hover:border-red group-hover:text-red md:left-[120px]">
            {t({ es: "Ver todo el trabajo", en: "See all work" })}
          </span>
        </div>
      </Link>
    </section>
  );
}
