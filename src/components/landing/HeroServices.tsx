"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import type { Category } from "@/lib/work";

/** First item appears this long after mount, then one more every `STEP_MS`
 * — a slow reveal timed to read while the hero video is still playing,
 * not a page-load flash. */
const START_DELAY_MS = 9500;
const STEP_MS = 450;

/**
 * "What we do:" label + list overlaid on the hero video — each of the 6
 * Work categories fades in one at a time and links straight to its page.
 * Same reveal timing on every size; only the position/size of the block
 * changes — right side mid-height on desktop, centered below the candle
 * on mobile (smaller type there).
 */
export default function HeroServices({ categories }: { categories: Category[] }) {
  const { locale } = useLocale();
  // Step 0 is the "WHAT WE DO:" label itself — nothing shows at all until
  // the first timer fires, then the label and each category reveal one by
  // one in the same sequence.
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const steps = categories.length + 1;
    const timers = Array.from({ length: steps }, (_, i) =>
      setTimeout(() => setVisible((v) => Math.max(v, i + 1)), START_DELAY_MS + i * STEP_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [categories]);

  if (categories.length === 0) return null;

  const label = (size: string) => (
    <p
      className={`mb-4 font-serif ${size} uppercase leading-[1.2] tracking-[-0.03em] text-cream transition-all duration-500 ease-out ${
        visible > 0 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      What we do:
    </p>
  );

  const list = (size: string) => (
    <ul className="space-y-2">
      {categories.map((c, i) => (
        <li
          key={c.slug}
          className={`transition-all duration-500 ease-out ${
            visible > i + 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <Link
            href={`/work/${c.slug}`}
            className={`whitespace-nowrap font-serif ${size} uppercase leading-[1.3] tracking-[-0.03em] text-cream transition-colors hover:text-red`}
          >
            [{c.index}] {c.name[locale]}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Mobile/tablet — below where the candle sits, text left-aligned.
          pl-[6vw] matches AboutIntro's left margin (the "Somos de darle una
          vuelta..." paragraph below it), +8px nudge to the right on top. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-start pl-[calc(6vw+8px)] text-left lg:hidden">
        <div className="pointer-events-auto">
          {label("text-[13px]")}
          {list("text-[13px]")}
        </div>
      </div>

      {/* Desktop */}
      <div className="pointer-events-none absolute inset-0 hidden items-center lg:flex">
        <div className="pointer-events-auto ml-[61%] mt-32 text-left xl:ml-[65%]">
          {label("text-[17px]")}
          {list("text-[17px]")}
        </div>
      </div>
    </>
  );
}
