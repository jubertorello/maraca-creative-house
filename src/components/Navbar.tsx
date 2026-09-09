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
// ...except these — a light-listed page (or one of its sub-paths) whose own
// top is actually dark, like the Estrategia manifesto page.
const LIGHT_AT_REST_EXCEPT = ["/work/estrategia"];
// Pages painted charcoal (not cream) once scrolled, same as home — every
// section on these pages is dark, so a cream bar (and its border) would be
// the wrong call.
const CHARCOAL_ON_SCROLL = ["/", "/work/estrategia", "/team"];

/**
 * Transparent over the hero on every page; paints a solid bar once scrolled.
 * Painted colour: charcoal on the home page, brand cream everywhere else.
 * Text flips to dark whenever it would otherwise sit cream-on-light.
 * Below `md`, the links + locale toggle collapse into a hamburger menu.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation and stop background scroll while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // The /admin backoffice has its own chrome — the public site's Navbar
  // shouldn't wrap it. (Placed after every hook above so hook order stays
  // stable across renders.)
  if (pathname?.startsWith("/admin")) return null;

  const matches = (list: string[]) =>
    list.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // At rest, Work pages open on a light section → dark text; elsewhere the
  // hero is dark → light text (Estrategia is a `/work` page but opens dark).
  const restingDark = matches(LIGHT_AT_REST) && !matches(LIGHT_AT_REST_EXCEPT);
  const paintCharcoal = matches(CHARCOAL_ON_SCROLL);
  // The mobile menu, once open, always shows solid — pick its theme the same
  // way the painted bar would, so it reads correctly over any hero.
  const solid = scrolled || open;
  const lightText = solid ? paintCharcoal : !restingDark;

  const barClass = !solid
    ? "bg-transparent"
    : paintCharcoal
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
        <Link
          href="/"
          aria-label="MARACA — inicio"
          className="shrink-0"
          onClick={() => setOpen(false)}
        >
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

        {/* desktop links */}
        <ul className="hidden flex-1 items-center gap-x-6 text-[15px] font-light leading-[1.2] tracking-[var(--tracking-nav)] md:flex md:gap-x-[61px]">
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

        {/* desktop locale toggle */}
        <div className="hidden shrink-0 items-center gap-2 text-[15px] font-light tracking-[var(--tracking-nav)] md:flex">
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

        {/* mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="ml-auto flex h-8 w-8 shrink-0 flex-col items-center justify-center gap-[5px] md:hidden"
        >
          <span
            className={`h-px w-6 bg-current transition-transform duration-200 ${open ? "translate-y-[3px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-6 bg-current transition-transform duration-200 ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* mobile menu panel */}
      {open && (
        <div
          className={[
            "flex flex-col gap-8 px-6 pb-10 pt-4 md:hidden",
            paintCharcoal ? "bg-charcoal" : "bg-cream",
          ].join(" ")}
        >
          <ul className="flex flex-col gap-6 text-2xl font-light leading-[1.2] tracking-[var(--tracking-nav)]">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={active ? "text-red" : ""}
                  >
                    {link.label[locale]}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3 text-[15px] font-light tracking-[var(--tracking-nav)]">
            {LOCALES.map((l, i) => (
              <span key={l} className="flex items-center gap-3">
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
        </div>
      )}
    </header>
  );
}
