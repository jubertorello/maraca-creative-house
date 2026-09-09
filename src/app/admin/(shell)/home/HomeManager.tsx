"use client";

import { useState } from "react";
import Link from "next/link";
import type { HomeContent } from "@/lib/site-content";
import ResponsiveVideoField from "../ResponsiveVideoField";

export default function HomeManager({ home }: { home: HomeContent }) {
  const [heroVideo, setHeroVideo] = useState(home.heroVideo);
  const [aboutEs, setAboutEs] = useState(home.aboutText.es);
  const [aboutEn, setAboutEn] = useState(home.aboutText.en);
  const [recentWorkVideo, setRecentWorkVideo] = useState(home.recentWorkVideo);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/content/home", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heroVideo,
        aboutText: { es: aboutEs, en: aboutEn },
        recentWorkVideo,
      } satisfies HomeContent),
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

      <h1 className="mb-1 text-2xl font-medium">Home</h1>
      <p className="mb-8 text-sm text-ink/50">
        Los tipos de trabajo (sección &quot;Participadas&quot;) se editan en{" "}
        <Link href="/admin/work" className="underline hover:text-ink">
          Work
        </Link>
        , y el carrusel de marcas en{" "}
        <Link href="/admin/about" className="underline hover:text-ink">
          About us
        </Link>
        .
      </p>

      <section className="rounded-lg border border-black/10 bg-white p-6">
        <ResponsiveVideoField
          label="Video principal (arriba)"
          value={heroVideo}
          onChange={setHeroVideo}
        />

        <label className="mb-2 block text-sm">
          <span className="mb-1 block text-ink/60">
            Texto &quot;Quiénes somos&quot; (ES) — envolvé una palabra o frase entre asteriscos
            para que salga en rojo/cursiva, ej: *creative house*
          </span>
          <textarea
            value={aboutEs}
            onChange={(e) => setAboutEs(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </label>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-ink/60">Text &quot;Quiénes somos&quot; (EN)</span>
          <textarea
            value={aboutEn}
            onChange={(e) => setAboutEn(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </label>

        <ResponsiveVideoField
          label="Video de abajo (showreel, antes del footer)"
          value={recentWorkVideo}
          onChange={setRecentWorkVideo}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
          {savedAt && <span className="text-sm text-green-600">Guardado ✓</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </section>
    </div>
  );
}
