"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, CASES, MAX_REVEAL_CLIENTS, type Category, type CaseStudy } from "@/lib/work";
import { useLocale } from "@/lib/i18n";

/**
 * The 6 "Participadas" tiles — Figma "Landing entera" > Participadas (8:8),
 * section 1440×489. Image row ("Feature cards 5", 6013:15) is 1283 wide, 4px
 * gap, each image 211×178, positioned x 79 / y 189 inside the section.
 * Label block sits at y ~109 ([n]) / ~149 (name) — i.e. ~109px above [n],
 * ~26px from name to image. Labels are Bricolage ExtraLight 12px / -6%.
 *
 * The name always reserves a fixed 2-line-tall slot (`min-h-[2.3em]`), even
 * when it only needs one line — so the collapsed stack's total height, and
 * therefore `[n]`'s position within it, is the same on every tile. A
 * one-line name just leaves blank space at the bottom of its own slot,
 * i.e. more room between the text and the photo.
 *
 * `reveal` (Work index only): on hover the category name turns red and its
 * client list deploys **upward, above the title** — the title and image never
 * move (Figma 6054:162 / 6054:213). The page using `reveal` must leave enough
 * clearance above the grid for the tallest list (see MAX_REVEAL_CLIENTS).
 *
 * Touch devices have no hover, so the list would otherwise never be
 * reachable there — on a device with `hover:none` (checked at click time,
 * not render time, so this stays SSR-safe), the first tap on the name opens
 * the list instead of navigating (`preventDefault`); a second tap on it (or
 * a tap on the photo, which always still navigates) goes to the category.
 * `data-open` mirrors the `:hover` classes via `group-data-[open=true]:`.
 */
const HAS_PHOTOS = true;

/** Forced 2-line breaks for names that must wrap a specific way regardless
 * of length (e.g. "Diseño web" is short enough for one line by the
 * character-count rule below, but should still break as "Diseño" / "web"). */
const FORCED_BREAKS: Record<string, [string, string]> = {
  "Campañas de publicidad": ["Campañas de", "publicidad"],
  "Advertising campaigns": ["Advertising", "campaigns"],
  "Diseño web": ["Diseño", "web"],
  "Web design": ["Web", "design"],
};

/** ≤22 chars → one line; longer → two balanced lines split at a space. */
function titleLines(name: string, max = 22): string[] {
  if (FORCED_BREAKS[name]) return FORCED_BREAKS[name];
  if (name.length <= max) return [name];
  const words = name.split(" ");
  let first = "";
  for (let i = 0; i < words.length - 1; i++) {
    const next = first ? `${first} ${words[i]}` : words[i];
    if (next.length > max && first) break;
    first = next;
  }
  return [first, name.slice(first.length).trim()];
}

export default function CategoryGrid({
  reveal = false,
  categories = CATEGORIES,
  cases = CASES,
}: {
  reveal?: boolean;
  /** Live-fetched categories/cases from the server component that renders
   * this (see /work/page.tsx) — defaults to the build-time snapshot so
   * every other caller keeps working unchanged. */
  categories?: Category[];
  cases?: CaseStudy[];
}) {
  const { t, locale } = useLocale();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const getCaseHref = (category: string, client: string): string | null => {
    const found = cases.find(
      (c) =>
        c.category === category &&
        c.client.trim().toLowerCase() === client.trim().toLowerCase(),
    );
    return found ? `/work/${category}/${found.slug}` : null;
  };

  return (
    <div className="mx-auto w-full max-w-[1283px] px-[5.5vw] xl:px-0">
      <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => {
          // Hovering the tile reveals the client list (if any) — the type
          // name should redden whenever hover does something, i.e. it's
          // clickable OR it has a list to reveal.
          const hasList = reveal && c.clients.length > 0;
          const nameReacts = c.enabled || hasList;
          const shown = c.clients.slice(0, MAX_REVEAL_CLIENTS);
          const hasMore = c.clients.length > MAX_REVEAL_CLIENTS;
          const isOpen = openSlug === c.slug;

          const handleLabelClick = (e: React.MouseEvent) => {
            if (!hasList) return;
            const touchOnly =
              typeof window !== "undefined" &&
              window.matchMedia("(hover: none)").matches;
            if (touchOnly && !isOpen) {
              e.preventDefault();
              setOpenSlug(c.slug);
            }
          };

          const labelContent = (
            <>
              <span
                className={[
                  "block text-center text-[12px] font-extralight leading-[1.2] tracking-[-0.06em] text-ink/70",
                  nameReacts ? `transition-colors group-hover:text-red ${isOpen ? "!text-red" : ""}` : "",
                ].join(" ")}
              >
                [{c.index}]
              </span>
              <span
                className={[
                  "mt-[10px] block min-h-[2.3em] whitespace-nowrap text-[12px] font-extralight uppercase leading-[1.15] tracking-[-0.06em] text-ink",
                  nameReacts ? `transition-colors group-hover:text-red ${isOpen ? "!text-red" : ""}` : "",
                ].join(" ")}
              >
                {titleLines(c.name[locale]).map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </>
          );

          const image = (
            <div className="relative aspect-[211/178] w-full overflow-hidden bg-mist">
              {HAS_PHOTOS && (
                <Image
                  src={c.image ?? `/media/services/${c.slug}.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 214px"
                  className="object-cover"
                />
              )}
            </div>
          );

          return (
            <li
              key={c.slug}
              data-open={isOpen ? "true" : undefined}
              className={[
                "group flex flex-col",
                c.enabled ? "" : "opacity-70",
              ].join(" ")}
            >
              {/* spacer: reserves the static Figma gap above the image so
                  every column's image lines up, whatever the title's line
                  count. The label itself is pinned to its bottom edge. */}
              <div className="relative h-[clamp(4.2rem,12vw,173px)]">
                {/* bottom-anchored, normal-flow stack: [n] + name + (on
                    hover) the client list, in that DOM order. The list
                    isn't absolutely positioned, so expanding it grows this
                    whole block's height — since the block stays pinned to
                    the image's top edge, the growth pushes [n] and the name
                    upward together, with the list sitting between them and
                    the image (deploys upward, name rises, image never
                    moves).
                    Below `lg` the grid stacks into several rows with only a
                    tiny gap between them, so an expanding tile has nowhere
                    near enough clearance and rises into the photo of the
                    row above. Rather than force huge permanent gaps between
                    every row (ruins the tight rest-state grid) or leave the
                    label see-through against that photo, the whole block —
                    label included — gets an opaque card background the
                    moment it's expanded (hover or tapped open), so it reads
                    as a floating panel over whatever it overlaps instead of
                    broken, half-covered text. */}
                <div
                  className={`absolute inset-x-0 bottom-0 flex flex-col pb-3 transition-[background-color,box-shadow] duration-300 ${
                    // Desktop hover deploys the list transparently over
                    // whatever's below (there's reserved clearance above
                    // the grid for it, so nothing gets covered) — same as
                    // it always looked. Only the tap-opened state on touch
                    // devices (no reserved clearance, so it can land over a
                    // neighbouring photo) gets the opaque floating-card
                    // background.
                    isOpen
                      ? "rounded-t-sm bg-cream shadow-[0_-16px_20px_-12px_rgba(0,0,0,0.18)]"
                      : ""
                  }`}
                >
                  {c.enabled ? (
                    <Link
                      href={`/work/${c.slug}`}
                      onClick={handleLabelClick}
                      className="block focus:outline-none"
                    >
                      {labelContent}
                    </Link>
                  ) : (
                    labelContent
                  )}

                  {reveal && c.clients.length > 0 && (
                    <ul
                      className={`pointer-events-none max-h-0 overflow-hidden pt-2 transition-[max-height] duration-500 ease-out group-hover:pointer-events-auto group-hover:max-h-[280px] ${
                        // Tapped open (touch devices): unlike hover, there's
                        // no clearance reserved above the grid for this, so
                        // cap it lower and let it scroll instead of growing
                        // into whatever content sits above the tiles.
                        isOpen ? "!pointer-events-auto !max-h-[160px] !overflow-y-auto" : ""
                      }`}
                    >
                      {shown.map((name, i) => {
                        const href = getCaseHref(c.slug, name);
                        const itemClass = `block translate-y-2 text-[12px] font-extralight uppercase leading-[1.18] tracking-[-0.06em] text-ink opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 ${
                          isOpen ? "!translate-y-0 !opacity-100" : ""
                        }`;
                        return (
                          <li key={name} style={{ transitionDelay: `${i * 14}ms` }}>
                            {href ? (
                              <Link href={href} className={`${itemClass} hover:!text-red`}>
                                {name}
                              </Link>
                            ) : (
                              <span className={itemClass}>{name}</span>
                            )}
                          </li>
                        );
                      })}
                      {hasMore && (
                        <li
                          style={{ transitionDelay: `${shown.length * 14}ms` }}
                        >
                          <Link
                            href={`/work/${c.slug}`}
                            className={`block translate-y-2 text-[12px] font-extralight uppercase italic leading-[1.18] tracking-[-0.06em] text-ink/60 opacity-0 transition duration-300 hover:!text-red group-hover:translate-y-0 group-hover:opacity-100 ${
                              isOpen ? "!translate-y-0 !opacity-100" : ""
                            }`}
                          >
                            {t({ es: "Ver todas →", en: "See all →" })}
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* image 211 : 178 */}
              {c.enabled ? (
                <Link href={`/work/${c.slug}`} className="block focus:outline-none">
                  {image}
                </Link>
              ) : (
                image
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
