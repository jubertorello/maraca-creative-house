"use client";

import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, MAX_REVEAL_CLIENTS, getCaseHref } from "@/lib/work";
import { useLocale } from "@/lib/i18n";

/**
 * The 6 "Participadas" tiles — Figma "Landing entera" > Participadas (8:8),
 * section 1440×489. Image row ("Feature cards 5", 6013:15) is 1283 wide, 4px
 * gap, each image 211×178, positioned x 79 / y 189 inside the section.
 * Label block sits at y ~109 ([n]) / ~149 (name) — i.e. ~109px above [n],
 * ~26px from name to image. Labels are Bricolage ExtraLight 12px / -6%.
 *
 * `reveal` (Work index only): on hover the category name turns red and its
 * client list deploys **upward, above the title** — the title and image never
 * move (Figma 6054:162 / 6054:213). The page using `reveal` must leave enough
 * clearance above the grid for the tallest list (see MAX_REVEAL_CLIENTS).
 */
const HAS_PHOTOS = true;

/** ≤22 chars → one line; longer → two balanced lines split at a space. */
function titleLines(name: string, max = 22): string[] {
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

export default function CategoryGrid({ reveal = false }: { reveal?: boolean }) {
  const { t, locale } = useLocale();

  return (
    <div className="mx-auto w-full max-w-[1283px] px-[5.5vw] xl:px-0">
      <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c) => {
          // Hovering the tile reveals the client list (if any) — the type
          // name should redden whenever hover does something, i.e. it's
          // clickable OR it has a list to reveal.
          const nameReacts = c.enabled || (reveal && c.clients.length > 0);
          const shown = c.clients.slice(0, MAX_REVEAL_CLIENTS);
          const hasMore = c.clients.length > MAX_REVEAL_CLIENTS;

          const labelContent = (
            <>
              <span
                className={[
                  "block text-center text-[12px] font-extralight leading-[1.2] tracking-[-0.06em] text-ink/70",
                  nameReacts ? "transition-colors group-hover:text-red" : "",
                ].join(" ")}
              >
                [{c.index}]
              </span>
              <span
                className={[
                  "mt-[10px] block whitespace-nowrap text-[12px] font-extralight uppercase leading-[1.15] tracking-[-0.06em] text-ink",
                  nameReacts ? "transition-colors group-hover:text-red" : "",
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
                  src={`/media/services/${c.slug}.jpg`}
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
                    moves). */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col pb-3">
                  {c.enabled ? (
                    <Link href={`/work/${c.slug}`} className="block focus:outline-none">
                      {labelContent}
                    </Link>
                  ) : (
                    labelContent
                  )}

                  {reveal && c.clients.length > 0 && (
                    <ul className="pointer-events-none max-h-0 overflow-hidden transition-[max-height] duration-500 ease-out group-hover:pointer-events-auto group-hover:max-h-[280px]">
                      {shown.map((name, i) => {
                        const href = getCaseHref(c.slug, name);
                        const itemClass =
                          "block translate-y-2 text-[12px] font-extralight uppercase leading-[1.18] tracking-[-0.06em] text-ink opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100";
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
                            className="block translate-y-2 text-[12px] font-extralight uppercase italic leading-[1.18] tracking-[-0.06em] text-ink/60 opacity-0 transition duration-300 hover:!text-red group-hover:translate-y-0 group-hover:opacity-100"
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
