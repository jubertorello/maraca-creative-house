"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import type { ResponsiveVideo } from "@/lib/site-content";
import ResponsiveVideoSources from "@/components/ResponsiveVideoSources";
import { useVideoSourceFix } from "@/lib/useVideoSourceFix";

const FALLBACK: ResponsiveVideo = { desktop: "/media/recent-work.mp4" };

/**
 * "Recent Work" — Figma "Landing entera" > Hero #2 (6044:285), bg #1A1A1B.
 * Full-bleed showreel video with a "See all work" link over it (no display
 * type on top of the video). The whole section links through to /work.
 * Video: /public/media/recent-work.mp4.
 */
export default function RecentWork({ video = FALLBACK }: { video?: ResponsiveVideo }) {
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  useVideoSourceFix(videoRef);

  return (
    <section className="relative bg-charcoal text-cream">
      <Link href="/work" className="group block">
        <div className="relative h-[92svh] min-h-[520px] w-full overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-90"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <ResponsiveVideoSources video={video} />
          </video>

          <div className="absolute inset-0 bg-charcoal/45" />

          <span className="absolute bottom-8 left-6 border-b border-cream pb-1 text-sm uppercase tracking-widest transition-colors group-hover:border-red group-hover:text-red md:left-[120px]">
            {t({ es: "Ver todo el trabajo", en: "See all work" })}
          </span>
        </div>
      </Link>
    </section>
  );
}
