"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import type { Category } from "@/lib/work";

/**
 * Placeholder area page for categories whose clients are already named
 * (shown on hover from the Work index) but whose page design isn't ready
 * yet — Creación de contenido y shootings, Diseño web, Eventos.
 */
export default function PendingView({ category }: { category: Category }) {
  const { t, locale } = useLocale();

  return (
    <section className="-mt-20 flex min-h-[70vh] flex-col bg-cream px-6 pb-24 pt-[104px] md:-mt-[120px] md:px-[80px] md:pb-32 md:pt-[144px]">
      <div className="flex items-baseline justify-between gap-6">
        <h1 className="flex items-baseline gap-3 font-serif text-[clamp(1.5rem,3.4vw,2.5rem)] font-light uppercase leading-none tracking-[-0.03em] text-ink">
          <span className="text-sm tabular-nums text-ink/40">
            [{category.index}]
          </span>
          {category.name[locale]}
        </h1>
        <Link
          href="/work"
          className="shrink-0 text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-red"
        >
          {t({ es: "Volver", en: "Back" })}
        </Link>
      </div>

      <p className="mt-24 font-serif text-2xl font-light italic text-ink/60 md:mt-32">
        {t({ es: "Diseño pendiente.", en: "Design coming soon." })}
      </p>
    </section>
  );
}
