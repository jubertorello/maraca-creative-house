"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/navigation";
import { useLocale, type Locale } from "@/lib/i18n";

const LOCALES: Locale[] = ["es", "en"];

// Pages whose top section is a light (cream) background rather than a dark
// hero — the resting (unpainted) navbar needs dark text on these.
const LIGHT_AT_REST = ["/work", "/contact", "/privacy-policy"];

/**
 * Transparent over the hero on every page; paints a solid bar once scrolled.
 * Painted colour: charcoal on the home page, brand cream everywhere else.
 * Text flips to dark whenever it would otherwise sit cream-on-light.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";
  // At rest, Work pages open on a light section → dark text; elsewhere the hero
  // is dark → light text. When painted, home is charcoal (light text), the rest
  // is cream (dark text).
  const restingDark = LIGHT_AT_REST.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const lightText = scrolled ? isHome : !restingDark;

  const barClass = !scrolled
    ? "bg-transparent"
    : isHome
      ? "bg-charcoal"
      : "bg-cream border-b border-ink/10";

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        barClass,
        lightText ? "text-cream" : "text-ink",
      ].join(" ")}
    >
      <nav className="flex h-20 items-center gap-6 px-6 md:h-[120px] md:gap-10 md:pl-[120px] md:pr-20">
        <Link href="/" aria-label="MARACA — inicio" className="shrink-0">
          <Image
            src="/brand/maraca-logo.png"
            alt="MARACA"
            width={39}
            height={22}
            priority
            className={[
              "h-[22px] w-auto transition-[filter] duration-300",
              lightText ? "" : "brightness-0",
            ].join(" ")}
          />
        </Link>

        <ul className="flex flex-1 items-center gap-x-6 text-[15px] font-light leading-[1.2] tracking-[var(--tracking-nav)] md:gap-x-[61px]">
          {NAV_LINKS.map((link, i) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li
                key={link.href}
                className={i === NAV_LINKS.length - 1 ? "ml-auto" : undefined}
              >
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "whitespace-nowrap transition-colors hover:text-red",
                    active ? "text-red" : "",
                  ].join(" ")}
                >
                  {link.label[locale]}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-2 text-[15px] font-light tracking-[var(--tracking-nav)]">
          {LOCALES.map((l, i) => (
            <span key={l} className="flex items-center gap-2">
              {i > 0 && (
                <span className={lightText ? "text-cream/40" : "text-ink/30"}>
                  |
                </span>
              )}
              <button
                type="button"
                onClick={() => setLocale(l)}
                aria-pressed={locale === l}
                className={[
                  "uppercase transition-colors hover:text-red",
                  locale === l ? "text-red" : "",
                ].join(" ")}
              >
                {l}
              </button>
            </span>
          ))}
        </div>
      </nav>
    </header>
  );
}
