"use client";

import { useState } from "react";
import Link from "next/link";
import type { TeamContent } from "@/lib/site-content";
import type { Member } from "@/lib/team";
import ResponsiveVideoField from "../ResponsiveVideoField";
import MembersManager from "./MembersManager";

export default function TeamManager({
  content,
  team,
}: {
  content: TeamContent;
  team: Member[];
}) {
  const [heroVideo, setHeroVideo] = useState(content.heroVideo);
  const [tagline, setTagline] = useState(content.tagline);
  const [titleEs, setTitleEs] = useState(content.joinUs.title.es);
  const [titleEn, setTitleEn] = useState(content.joinUs.title.en);
  const [p1Es, setP1Es] = useState(content.joinUs.paragraph1.es);
  const [p1En, setP1En] = useState(content.joinUs.paragraph1.en);
  const [p2Es, setP2Es] = useState(content.joinUs.paragraph2.es);
  const [p2En, setP2En] = useState(content.joinUs.paragraph2.en);
  const [email, setEmail] = useState(content.joinUs.email);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/content/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heroVideo,
        tagline,
        joinUs: {
          title: { es: titleEs, en: titleEn },
          paragraph1: { es: p1Es, en: p1En },
          paragraph2: { es: p2Es, en: p2En },
          email,
        },
      } satisfies TeamContent),
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

      <h1 className="mb-1 text-2xl font-medium">Team</h1>
      <p className="mb-8 text-sm text-ink/50">
        Video del hero, el equipo y el bloque de &quot;únete&quot; al final de la página.
      </p>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Hero
        </h2>
        <ResponsiveVideoField label="Video" value={heroVideo} onChange={setHeroVideo} />
        <label className="block text-sm">
          <span className="mb-1 block text-ink/60">
            Frase (siempre en inglés, como en el sitio — ej. &quot;Many minds, one creative
            house&quot;)
          </span>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </label>
      </section>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Equipo
        </h2>
        <MembersManager initial={team} />
      </section>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Bloque &quot;únete&quot; (final de la página)
        </h2>

        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Título (ES)</span>
            <textarea
              value={titleEs}
              onChange={(e) => setTitleEs(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Título (EN)</span>
            <textarea
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
          </label>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Párrafo 1 (ES)</span>
            <textarea
              value={p1Es}
              onChange={(e) => setP1Es(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Párrafo 1 (EN)</span>
            <textarea
              value={p1En}
              onChange={(e) => setP1En(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
          </label>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Párrafo 2 — uppercase (ES)</span>
            <textarea
              value={p2Es}
              onChange={(e) => setP2Es(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Párrafo 2 — uppercase (EN)</span>
            <textarea
              value={p2En}
              onChange={(e) => setP2En(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
          </label>
        </div>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-ink/60">Email de contacto</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full max-w-sm rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </label>

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
