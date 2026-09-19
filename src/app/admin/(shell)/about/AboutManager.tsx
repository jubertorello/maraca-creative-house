"use client";

import { useState } from "react";
import Link from "next/link";
import type { AboutContent, AboutTextBlock } from "@/lib/site-content";
import type { Client } from "@/lib/clients";
import ResponsiveVideoField from "../ResponsiveVideoField";
import ClientsManager from "./ClientsManager";
import SaveBar from "../SaveBar";

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

const EMPTY_BLOCK: AboutTextBlock = {
  title: { es: "", en: "" },
  body: { es: "", en: "" },
  bodyStyle: "caps",
};

export default function AboutManager({
  about,
  clients,
}: {
  about: AboutContent;
  clients: Client[];
}) {
  const [heroVideo, setHeroVideo] = useState(about.heroVideo);
  const [blocks, setBlocks] = useState(about.blocks);
  const [logosTitleEs, setLogosTitleEs] = useState(about.logosTitle.es);
  const [logosTitleEn, setLogosTitleEn] = useState(about.logosTitle.en);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateBlock = (i: number, patch: Partial<AboutTextBlock>) =>
    setBlocks((list) => list.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/content/about", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heroVideo,
        blocks,
        logosTitle: { es: logosTitleEs, en: logosTitleEn },
      } satisfies AboutContent),
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

      <h1 className="mb-1 text-2xl font-medium">About us</h1>
      <p className="mb-8 text-sm text-ink/50">
        Video, textos y marcas de la página About us. Las marcas alimentan también el
        carrusel de la Home.
      </p>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Video del hero
        </h2>
        <ResponsiveVideoField label="Video" value={heroVideo} onChange={setHeroVideo} />
      </section>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Textos &quot;Quiénes somos&quot;
        </h2>
        <p className="mb-4 text-xs text-ink/40">
          Los bloques debajo del video. El primero se muestra en cursiva; el resto, en
          mayúsculas — elegí el estilo de cada uno.
        </p>

        <div className="space-y-4">
          {blocks.map((b, i) => (
            <div key={i} className="rounded-lg border border-black/10 bg-[#faf9f6] p-4">
              <div className="mb-3 flex items-center justify-between">
                <select
                  value={b.bodyStyle}
                  onChange={(e) =>
                    updateBlock(i, { bodyStyle: e.target.value as AboutTextBlock["bodyStyle"] })
                  }
                  className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs outline-none focus:border-ink/40"
                >
                  <option value="italic">Cursiva</option>
                  <option value="caps">Mayúsculas</option>
                </select>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setBlocks((list) => move(list, i, i - 1))}
                    disabled={i === 0}
                    className="rounded px-2 py-0.5 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlocks((list) => move(list, i, i + 1))}
                    disabled={i === blocks.length - 1}
                    className="rounded px-2 py-0.5 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlocks((list) => list.filter((_, idx) => idx !== i))}
                    className="rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <p className="mb-1 text-xs text-ink/40">
                Título — apretá Enter donde quieras que corte la línea (si no, se acomoda solo
                según el ancho de pantalla).
              </p>
              <div className="mb-2 grid gap-2 sm:grid-cols-2">
                <textarea
                  value={b.title.es}
                  onChange={(e) => updateBlock(i, { title: { ...b.title, es: e.target.value } })}
                  placeholder="Título (ES)"
                  rows={2}
                  className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
                />
                <textarea
                  value={b.title.en}
                  onChange={(e) => updateBlock(i, { title: { ...b.title, en: e.target.value } })}
                  placeholder="Title (EN)"
                  rows={2}
                  className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <textarea
                  value={b.body.es}
                  onChange={(e) => updateBlock(i, { body: { ...b.body, es: e.target.value } })}
                  placeholder="Texto (ES)"
                  rows={3}
                  className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
                />
                <textarea
                  value={b.body.en}
                  onChange={(e) => updateBlock(i, { body: { ...b.body, en: e.target.value } })}
                  placeholder="Text (EN)"
                  rows={3}
                  className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setBlocks((list) => [...list, EMPTY_BLOCK])}
          className="mt-3 rounded-md border border-black/15 px-3 py-1.5 text-xs hover:border-black/30"
        >
          + Agregar bloque
        </button>
      </section>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Título sobre la grilla de marcas
        </h2>
        <p className="mb-4 text-xs text-ink/40">
          Apretá Enter donde quieras que corte la línea.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <textarea
            value={logosTitleEs}
            onChange={(e) => setLogosTitleEs(e.target.value)}
            placeholder="Título (ES)"
            rows={2}
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <textarea
            value={logosTitleEn}
            onChange={(e) => setLogosTitleEn(e.target.value)}
            placeholder="Title (EN)"
            rows={2}
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </div>
      </section>

      <SaveBar saving={saving} savedAt={savedAt} error={error} onSave={save} />

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Marcas
        </h2>
        <ClientsManager initial={clients} />
      </section>
    </div>
  );
}
