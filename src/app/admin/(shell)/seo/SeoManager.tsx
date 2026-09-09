"use client";

import { useState } from "react";
import Link from "next/link";
import type { SeoContent, SeoPageKey } from "@/lib/site-content";
import MediaUrlInput from "../MediaUrlInput";
import CharCounter from "../CharCounter";
import SaveBar from "../SaveBar";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

const PAGE_LABELS: Record<SeoPageKey, string> = {
  home: "Home",
  about: "About us",
  team: "Team",
  work: "Work (índice)",
  contact: "Contacto",
  privacyPolicy: "Política de privacidad",
};

// Home's title/description already live in "General" (defaultTitle +
// description, which Home falls back to) — listing it again here would
// just be the same fields twice under two different labels.
const LISTED_PAGE_KEYS: SeoPageKey[] = ["about", "team", "work", "contact", "privacyPolicy"];

export default function SeoManager({ seo }: { seo: SeoContent }) {
  const [titleSuffix, setTitleSuffix] = useState(seo.global.titleSuffix);
  const [defaultTitle, setDefaultTitle] = useState(seo.global.defaultTitle);
  const [description, setDescription] = useState(seo.global.description);
  const [keywordsText, setKeywordsText] = useState(seo.global.keywords.join(", "));
  const [ogImageUrl, setOgImageUrl] = useState(seo.global.ogImageUrl);
  const [pages, setPages] = useState(seo.pages);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePage = (key: SeoPageKey, patch: { title?: string; description?: string }) =>
    setPages((p) => ({ ...p, [key]: { ...p[key], ...patch } }));

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/content/seo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        global: {
          titleSuffix,
          defaultTitle,
          description,
          keywords: keywordsText
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          ogImageUrl,
        },
        pages,
      } satisfies SeoContent),
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

      <h1 className="mb-1 text-2xl font-medium">SEO</h1>
      <p className="mb-8 text-sm text-ink/50">
        Configuración general del sitio y título/descripción de cada página para buscadores
        y para la tarjeta que se ve al compartir en redes.
      </p>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          General
        </h2>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-ink/60">Título de Home (no lleva sufijo)</span>
          <input
            value={defaultTitle}
            onChange={(e) => setDefaultTitle(e.target.value)}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <CharCounter value={defaultTitle} max={TITLE_MAX} />
        </label>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-ink/60">
            Sufijo del sitio (aparece como &quot;Página | Sufijo&quot; en el resto de páginas)
          </span>
          <input
            value={titleSuffix}
            onChange={(e) => setTitleSuffix(e.target.value)}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </label>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-ink/60">Descripción general del sitio</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <CharCounter value={description} max={DESCRIPTION_MAX} />
        </label>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-ink/60">Palabras clave (separadas por coma)</span>
          <textarea
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-ink/60">
            Imagen para compartir (OG/redes) — 1200×630 recomendado
          </span>
          <MediaUrlInput
            value={ogImageUrl}
            onChange={setOgImageUrl}
            placeholder="URL de la imagen"
            accept="image/*"
          />
        </label>
      </section>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Por página
        </h2>
        <p className="mb-4 text-xs text-ink/40">
          Vacío = usa el título/descripción por defecto de cada página. Las categorías y
          casos de Work tienen su propio SEO en cada uno (/admin/work).
        </p>

        <div className="space-y-4">
          {LISTED_PAGE_KEYS.map((key) => (
            <div key={key} className="rounded-lg border border-black/10 bg-[#faf9f6] p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/50">
                {PAGE_LABELS[key]}
              </p>
              <input
                value={pages[key]?.title ?? ""}
                onChange={(e) => updatePage(key, { title: e.target.value })}
                placeholder="Título para buscadores"
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
              />
              <CharCounter value={pages[key]?.title ?? ""} max={TITLE_MAX} />
              <textarea
                value={pages[key]?.description ?? ""}
                onChange={(e) => updatePage(key, { description: e.target.value })}
                placeholder="Descripción para buscadores"
                rows={2}
                className="mt-2 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
              />
              <CharCounter value={pages[key]?.description ?? ""} max={DESCRIPTION_MAX} />
            </div>
          ))}
        </div>
      </section>

      <SaveBar saving={saving} savedAt={savedAt} error={error} onSave={save} />
    </div>
  );
}
