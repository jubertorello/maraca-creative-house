"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { CLIENTS_WITH_LOGO, type Client } from "@/lib/clients";

/** Roughly how fast the marquee scrolls, in px/s — kept constant no matter
 * how many logos are in the list (see the effect below), so adding or
 * removing clients from /admin/clients never speeds it up or slows it
 * down the way a fixed animation-duration would. */
const PX_PER_SECOND = 70;

/**
 * Brands carousel — Figma "Landing entera" > Participadas #2 (6183:1245),
 * bg #EBEDDE. Continuous marquee of client logos.
 * Comment #5: "crear un carrusel con logos de marcas (más pequeños)".
 * Clients editable from /admin/clients.
 */
export default function BrandsCarousel({
  clients = CLIENTS_WITH_LOGO,
}: {
  clients?: Client[];
}) {
  const withLogo = clients.filter((c) => c.logoUrl);
  // Two identical, back-to-back copies of the same list — no extra padding
  // or gap between them beyond the regular item gap, so the strip's first
  // half is pixel-identical to its second half. Animating translateX from
  // 0 to exactly -50% then loops seamlessly, with no jump at the seam.
  const items = [...withLogo, ...withLogo];

  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // Half of the (doubled) track's width is exactly one full list's width
    // — the actual distance the marquee travels before it loops.
    const setWidth = track.scrollWidth / 2;
    if (setWidth > 0) {
      track.style.animationDuration = `${setWidth / PX_PER_SECOND}s`;
    }
  }, [withLogo.length]);

  return (
    <section
      className="overflow-hidden bg-cream py-12"
      aria-label="Marcas"
    >
      <div ref={trackRef} className="marquee flex w-max items-center gap-20">
        {items.map((c, i) => (
          <span
            key={i}
            className="flex h-7 shrink-0 items-center md:h-8"
            aria-hidden={i >= withLogo.length}
          >
            <Image
              src={c.logoUrl!}
              alt={c.name}
              width={160}
              height={32}
              // max-w caps how wide a logo can stretch before object-contain
              // starts shrinking it to fit — without it, a wordmark with a
              // much wider aspect ratio than the rest (e.g. a single-line
              // logo vs. a compact mark) renders far wider than its
              // neighbors at the same fixed height, and visually dominates
              // the row even though the box height is identical for all.
              className="h-full w-auto max-w-[120px] object-contain md:max-w-[140px]"
            />
          </span>
        ))}
      </div>
    </section>
  );
}
