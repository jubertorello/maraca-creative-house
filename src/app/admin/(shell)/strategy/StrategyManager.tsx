"use client";

import { useState } from "react";
import Link from "next/link";
import type { StrategyContent } from "@/lib/site-content";
import ResponsiveVideoField from "../ResponsiveVideoField";
import SaveBar from "../SaveBar";

export default function StrategyManager({ content }: { content: StrategyContent }) {
  const [heroVideo, setHeroVideo] = useState(content.heroVideo);
  const [titleLine1Es, setTitleLine1Es] = useState(content.titleLine1.es);
  const [titleLine1En, setTitleLine1En] = useState(content.titleLine1.en);
  const [titleLine2Es, setTitleLine2Es] = useState(content.titleLine2.es);
  const [titleLine2En, setTitleLine2En] = useState(content.titleLine2.en);
  const [descriptionEs, setDescriptionEs] = useState(content.description.es);
  const [descriptionEn, setDescriptionEn] = useState(content.description.en);
  const [closingLineEs, setClosingLineEs] = useState(content.closingLine.es);
  const [closingLineEn, setClosingLineEn] = useState(content.closingLine.en);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/content/strategy", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heroVideo,
        titleLine1: { es: titleLine1Es, en: titleLine1En },
        titleLine2: { es: titleLine2Es, en: titleLine2En },
        description: { es: descriptionEs, en: descriptionEn },
        closingLine: { es: closingLineEs, en: closingLineEn },
      } satisfies StrategyContent),
    });
    setSaving(false);
    if (!res.ok) {
      setError("No se pudo guardar. Probá de nuevo.");
      return;
    }
    setSavedAt(Date.now());
  }

  return (
    <div>
      <Link href="/admin" className="mb-6 inline-block text-sm text-ink/50 hover:text-ink">
        ← Páginas
      </Link>

      <h1 className="mb-1 text-2xl font-medium">Estrategia</h1>
      <p className="mb-8 text-sm text-ink/50">
        La página de Estrategia (dentro de Work) — no tiene marcas ni casos propios, es un
        video y unos textos. El resto de su configuración (nombre, visibilidad) se edita en{" "}
        <Link href="/admin/work/estrategia" className="underline hover:text-ink">
          Work → Estrategia
        </Link>
        .
      </p>

      <section className="rounded-lg border border-black/10 bg-white p-6">
        <ResponsiveVideoField label="Video" value={heroVideo} onChange={setHeroVideo} />

        <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Título (2 líneas fijas)
        </h2>
        <div className="mb-2 grid gap-2 sm:grid-cols-2">
          <input
            value={titleLine1Es}
            onChange={(e) => setTitleLine1Es(e.target.value)}
            placeholder="Línea 1 (ES)"
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <input
            value={titleLine1En}
            onChange={(e) => setTitleLine1En(e.target.value)}
            placeholder="Line 1 (EN)"
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </div>
        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          <input
            value={titleLine2Es}
            onChange={(e) => setTitleLine2Es(e.target.value)}
            placeholder="Línea 2 (ES)"
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <input
            value={titleLine2En}
            onChange={(e) => setTitleLine2En(e.target.value)}
            placeholder="Line 2 (EN)"
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </div>

        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Texto sobre el video (arriba)
        </h2>
        <p className="mb-3 text-xs text-ink/40">
          Cada línea que escribas acá se muestra como su propio renglón — no se acomoda solo
          según el ancho de pantalla. En el diseño va en 3 líneas.
        </p>
        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          <textarea
            value={descriptionEs}
            onChange={(e) => setDescriptionEs(e.target.value)}
            rows={4}
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <textarea
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            rows={4}
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </div>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Texto debajo del video
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <textarea
            value={closingLineEs}
            onChange={(e) => setClosingLineEs(e.target.value)}
            rows={3}
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <textarea
            value={closingLineEn}
            onChange={(e) => setClosingLineEn(e.target.value)}
            rows={3}
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </div>
      </section>

      <SaveBar saving={saving} savedAt={savedAt} error={error} onSave={save} />
    </div>
  );
}
