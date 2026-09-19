"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContactContent } from "@/lib/site-content";
import SaveBar from "../SaveBar";

export default function ContactManager({ content }: { content: ContactContent }) {
  const [taglineEs, setTaglineEs] = useState(content.tagline.es);
  const [taglineEn, setTaglineEn] = useState(content.tagline.en);
  const [email, setEmail] = useState(content.email);
  const [titleEs, setTitleEs] = useState(content.title.es);
  const [titleEn, setTitleEn] = useState(content.title.en);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/content/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tagline: { es: taglineEs, en: taglineEn },
        email,
        title: { es: titleEs, en: titleEn },
      } satisfies ContactContent),
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

      <h1 className="mb-1 text-2xl font-medium">Contacto</h1>
      <p className="mb-8 text-sm text-ink/50">
        Textos de la página de contacto. Los campos del formulario (nombre, email, mensaje)
        no llevan texto propio para editar — son siempre los mismos.
      </p>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-ink/60">Frase de arriba (ES)</span>
          <textarea
            value={taglineEs}
            onChange={(e) => setTaglineEs(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </label>
        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-ink/60">Frase de arriba (EN)</span>
          <textarea
            value={taglineEn}
            onChange={(e) => setTaglineEn(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </label>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-ink/60">Email de contacto</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full max-w-sm rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </label>

        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Título (ES) — Enter corta la línea</span>
            <textarea
              value={titleEs}
              onChange={(e) => setTitleEs(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Title (EN) — Enter corta la línea</span>
            <textarea
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
            />
          </label>
        </div>

      </section>

      <SaveBar saving={saving} savedAt={savedAt} error={error} onSave={save} />
    </div>
  );
}
