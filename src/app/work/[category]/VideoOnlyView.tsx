"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import type { Category } from "@/lib/work";
import type { ResponsiveVideo } from "@/lib/site-content";
import MediaHero from "@/components/MediaHero";

/**
 * Page for any `kind: "video"` category — a full-bleed video and nothing
 * else (same component/styles as About's hero), for categories that don't
 * have a manifesto's title/description/closing line. Editable from
 * /admin/work/[category]. See also `ManifestoView` for `kind: "manifesto"`.
 */
export default function VideoOnlyView({
  category,
  video,
}: {
  category: Category;
  video?: ResponsiveVideo;
}) {
  const { t } = useLocale();

  return (
    <article className="relative bg-charcoal">
      <h1 className="sr-only">{t(category.name)}</h1>
      <MediaHero kind="video" className="bg-charcoal" video={video} />
      <Link
        href="/work"
        className="absolute right-6 top-6 z-10 text-xs uppercase tracking-widest text-cream/70 transition-colors hover:text-red md:right-[120px] md:top-8"
      >
        {t({ es: "Volver", en: "Back" })}
      </Link>
    </article>
  );
}
