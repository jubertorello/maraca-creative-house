"use client";

import { useState } from "react";
import Link from "next/link";
import type { FooterContent, FooterSocialLink } from "@/lib/site-content";
import SaveBar from "../SaveBar";

const LABELS: FooterSocialLink["label"][] = ["Instagram", "LinkedIn", "TikTok"];

export default function FooterManager({ content }: { content: FooterContent }) {
  const [email, setEmail] = useState(content.email);
  const [socials, setSocials] = useState(content.socials);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateSocial = (label: FooterSocialLink["label"], href: string) =>
    setSocials((list) =>
      list.some((s) => s.label === label)
        ? list.map((s) => (s.label === label ? { ...s, href } : s))
        : [...list, { label, href }],
    );

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/content/footer", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, socials } satisfies FooterContent),
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

      <h1 className="mb-1 text-2xl font-medium">Footer</h1>
      <p className="mb-8 text-sm text-ink/50">
        El pie de página se repite igual en todo el sitio — mail de contacto y links a redes
        sociales.
      </p>

      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <label className="mb-6 block text-sm">
          <span className="mb-1 block text-ink/60">Email de contacto</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full max-w-sm rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </label>

        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Redes sociales
        </h2>
        <p className="mb-4 text-xs text-ink/40">
          Dejá el campo vacío y ese ícono no va a llevar a ningún lado — mejor completar los
          tres con el link real del perfil de MARACA.
        </p>
        <div className="space-y-3">
          {LABELS.map((label) => (
            <label key={label} className="block text-sm">
              <span className="mb-1 block text-ink/60">{label}</span>
              <input
                value={socials.find((s) => s.label === label)?.href ?? ""}
                onChange={(e) => updateSocial(label, e.target.value)}
                placeholder={`https://${label.toLowerCase()}.com/maraca...`}
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
              />
            </label>
          ))}
        </div>

      </section>

      <SaveBar saving={saving} savedAt={savedAt} error={error} onSave={save} />
    </div>
  );
}
