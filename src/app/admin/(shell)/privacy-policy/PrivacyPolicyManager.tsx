"use client";

import { useState } from "react";
import Link from "next/link";
import type { PrivacyPolicyContent, PrivacyPolicySection } from "@/lib/site-content";
import SaveBar from "../SaveBar";

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

const EMPTY_SECTION: PrivacyPolicySection = {
  heading: { es: "", en: "" },
  body: { es: "", en: "" },
};

export default function PrivacyPolicyManager({ content }: { content: PrivacyPolicyContent }) {
  const [lastUpdatedEs, setLastUpdatedEs] = useState(content.lastUpdated.es);
  const [lastUpdatedEn, setLastUpdatedEn] = useState(content.lastUpdated.en);
  const [sections, setSections] = useState(content.sections);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateSection = (i: number, patch: Partial<PrivacyPolicySection>) =>
    setSections((list) => list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/content/privacyPolicy", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastUpdated: { es: lastUpdatedEs, en: lastUpdatedEn },
        sections,
      } satisfies PrivacyPolicyContent),
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

      <h1 className="mb-1 text-2xl font-medium">Política de privacidad</h1>
      <p className="mb-8 text-sm text-ink/50">
        El texto legal de /privacy-policy. Revisalo con quien corresponda antes de
        publicarlo — este editor no reemplaza asesoría legal.
      </p>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Última actualización
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={lastUpdatedEs}
            onChange={(e) => setLastUpdatedEs(e.target.value)}
            placeholder="ej. septiembre 2026"
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <input
            value={lastUpdatedEn}
            onChange={(e) => setLastUpdatedEn(e.target.value)}
            placeholder="e.g. September 2026"
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </div>
      </section>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Secciones
        </h2>

        <div className="space-y-4">
          {sections.map((s, i) => (
            <div key={i} className="rounded-lg border border-black/10 bg-[#faf9f6] p-4">
              <div className="mb-2 flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setSections((list) => move(list, i, i - 1))}
                  disabled={i === 0}
                  className="rounded px-2 py-0.5 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => setSections((list) => move(list, i, i + 1))}
                  disabled={i === sections.length - 1}
                  className="rounded px-2 py-0.5 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => setSections((list) => list.filter((_, idx) => idx !== i))}
                  className="rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>

              <div className="mb-2 grid gap-2 sm:grid-cols-2">
                <input
                  value={s.heading.es}
                  onChange={(e) => updateSection(i, { heading: { ...s.heading, es: e.target.value } })}
                  placeholder="Título (ES)"
                  className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
                />
                <input
                  value={s.heading.en}
                  onChange={(e) => updateSection(i, { heading: { ...s.heading, en: e.target.value } })}
                  placeholder="Title (EN)"
                  className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <textarea
                  value={s.body.es}
                  onChange={(e) => updateSection(i, { body: { ...s.body, es: e.target.value } })}
                  placeholder="Texto (ES)"
                  rows={3}
                  className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
                />
                <textarea
                  value={s.body.en}
                  onChange={(e) => updateSection(i, { body: { ...s.body, en: e.target.value } })}
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
          onClick={() => setSections((list) => [...list, EMPTY_SECTION])}
          className="mt-3 rounded-md border border-black/15 px-3 py-1.5 text-xs hover:border-black/30"
        >
          + Agregar sección
        </button>
      </section>

      <SaveBar saving={saving} savedAt={savedAt} error={error} onSave={save} />
    </div>
  );
}
