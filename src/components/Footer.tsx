"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { useLocale } from "@/lib/i18n";

/** Footer — Figma frame 6129:782 (About Us). Charcoal bar, single centered row. */

const SOCIALS: {
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedInIcon },
  { label: "TikTok", href: "https://tiktok.com", Icon: TikTokIcon },
];

export default function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cream">
      <div className="mx-auto flex min-h-[229px] flex-col items-start justify-center gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-[88px] md:py-0">
        <Link href="/" aria-label="MARACA — Creative House" className="shrink-0">
          <Image
            src="/brand/maraca-lockup.png"
            alt="MARACA Creative House"
            width={174}
            height={67}
            className="h-[67px] w-auto"
          />
        </Link>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-light text-cream/80">
          <span>© {year} Maraca</span>
          <span className="text-cream/30">|</span>
          <Link href="/privacy-policy" className="transition-colors hover:text-red">
            {t({ es: "Política de privacidad", en: "Privacy Policy" })}
          </Link>
        </p>

        <div className="flex items-center gap-5">
          <a
            href="mailto:hello@lamaraca.com"
            className="text-[15px] font-light transition-colors hover:text-red"
          >
            {t({ es: "Contacto", en: "Contact" })}
          </a>
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="transition-colors hover:text-red"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7" />
    </svg>
  );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.5 3c.3 2.1 1.6 3.8 3.5 4.2v2.5c-1.3.1-2.5-.3-3.6-1v6.2a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v2.6a3.3 3.3 0 1 0 2.3 3.1V3h2.8Z" />
    </svg>
  );
}
