import Image from "next/image";
import { CLIENTS_WITH_LOGO, type Client } from "@/lib/clients";

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
  const items = [...withLogo, ...withLogo];

  return (
    <section
      className="overflow-hidden bg-cream py-12"
      aria-label="Marcas"
    >
      <div className="marquee flex w-max items-center gap-20 pr-20">
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
