"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n";
import type { ResponsiveVideo } from "@/lib/site-content";
import type { Category } from "@/lib/work";
import ResponsiveVideoSources from "@/components/ResponsiveVideoSources";
import HeroServices from "@/components/landing/HeroServices";

const FALLBACK: ResponsiveVideo = { desktop: "/media/hero.mp4" };

/**
 * Landing hero — Figma "Landing entera" > Hero (5:8), 1440×900.
 * Full-bleed video below the sticky charcoal navbar. Plays once, then rests
 * on its last frame (no `loop`).
 * Source: /public/media/hero.mp4 ("WEB MARACA.mp4").
 *
 * We try to autoplay with sound on mount; browsers that block unmuted
 * autoplay (most of them, on first visit) reject that and we fall back to
 * muted so the video still plays. Either way a small, subtle icon lets the
 * visitor toggle sound on/off themselves.
 */
export default function HeroVideo({
  video = FALLBACK,
  categories = [],
}: {
  video?: ResponsiveVideo;
  categories?: Category[];
}) {
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.play()
      .then(() => setMuted(false))
      .catch(() => {
        // Autoplay-with-sound blocked — fall back to muted so it still plays.
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      });
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    if (!next) video.play().catch(() => {});
    setMuted(next);
  };

  return (
    <section className="relative -mt-20 h-[100svh] min-h-[560px] w-full overflow-hidden bg-charcoal md:-mt-[120px]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
      >
        <ResponsiveVideoSources video={video} />
      </video>

      <HeroServices categories={categories} />

      <button
        type="button"
        onClick={toggleSound}
        aria-label={
          muted
            ? t({ es: "Activar sonido", en: "Unmute" })
            : t({ es: "Silenciar", en: "Mute" })
        }
        className="absolute bottom-6 right-6 text-cream/40 transition-colors hover:text-cream/80 md:bottom-10 md:right-10"
      >
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M4 9v6h4l5 5V4L8 9H4Z" />
            <path d="M18 9l4 6M22 9l-4 6" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M4 9v6h4l5 5V4L8 9H4Z" />
            <path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 6a9 9 0 0 1 0 12" />
          </svg>
        )}
      </button>
    </section>
  );
}
