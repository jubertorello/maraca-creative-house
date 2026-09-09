"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category, CaseStudy } from "@/lib/work";
import MediaUrlInput from "../../MediaUrlInput";
import CharCounter from "../../CharCounter";

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function CategoryManager({
  category,
  cases,
}: {
  category: Category;
  cases: CaseStudy[];
}) {
  const router = useRouter();
  const [nameEs, setNameEs] = useState(category.name.es);
  const [nameEn, setNameEn] = useState(category.name.en);
  const [enabled, setEnabled] = useState(category.enabled);
  const [kind, setKind] = useState(category.kind ?? "listing");
  const [image, setImage] = useState(category.image ?? "");
  const [seoTitle, setSeoTitle] = useState(category.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(category.seoDescription ?? "");
  const [clients, setClients] = useState(category.clients);
  const [newClient, setNewClient] = useState("");
  const [caseList, setCaseList] = useState(cases);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveSettings() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/categories/${category.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: { es: nameEs, en: nameEn },
        enabled,
        kind: kind === "listing" ? undefined : kind,
        image: image || undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        // Listing categories derive `clients` from their cases server-side
        // (see syncCategoryClientsFromCases) — don't overwrite it with
        // whatever this form last loaded.
        ...(kind === "listing" ? {} : { clients }),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("No se pudo guardar. Probá de nuevo.");
      return;
    }
    setSavedAt(Date.now());
    router.refresh();
  }

  async function deleteCase(slug: string) {
    if (!confirm("¿Eliminar este caso? No se puede deshacer.")) return;
    await fetch(`/api/admin/cases/${category.slug}/${slug}`, { method: "DELETE" });
    setCaseList((list) => list.filter((c) => c.slug !== slug));
  }

  async function reorderCase(from: number, to: number) {
    // The number shown next to each case comes straight from its position
    // in this list (case #1 is whatever sits first) — recompute it here so
    // it updates immediately instead of waiting for a refresh; the server
    // recomputes the same way when it persists the new order.
    const reordered = move(caseList, from, to).map((c, i) => ({
      ...c,
      index: String(i + 1).padStart(2, "0"),
    }));
    setCaseList(reordered);
    await fetch("/api/admin/cases", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: category.slug, slugs: reordered.map((c) => c.slug) }),
    });
  }

  return (
    <div>
      <Link href="/admin/work" className="mb-6 inline-block text-sm text-ink/50 hover:text-ink">
        ← Work
      </Link>

      <h1 className="mb-8 text-2xl font-medium">{category.name.es}</h1>

      {/* --- Category settings --- */}
      <section className="mb-10 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Configuración
        </h2>
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Nombre (ES)</span>
            <input
              value={nameEs}
              onChange={(e) => setNameEs(e.target.value)}
              className="w-full rounded-md border border-black/15 px-3 py-2 outline-none focus:border-ink/40"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Nombre (EN)</span>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full rounded-md border border-black/15 px-3 py-2 outline-none focus:border-ink/40"
            />
          </label>
        </div>
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Tipo de página</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
              className="w-full rounded-md border border-black/15 bg-white px-3 py-2 outline-none focus:border-ink/40"
            >
              <option value="listing">Listado con casos propios (branding)</option>
              <option value="manifesto">Página única / manifiesto (estrategia)</option>
              <option value="pending">Diseño pendiente (placeholder)</option>
            </select>
          </label>
          <label className="flex items-end gap-2 text-sm">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Visible en la web</span>
          </label>
        </div>

        <label className="mb-6 block text-sm">
          <span className="mb-1 block text-ink/60">
            Imagen de la miniatura (Home y /work)
          </span>
          <MediaUrlInput
            value={image}
            onChange={setImage}
            placeholder={`URL de la imagen (o vacío = /media/services/${category.slug}.jpg)`}
            accept="image/*"
          />
        </label>

        <details className="mb-6 rounded-md border border-black/10 p-3">
          <summary className="cursor-pointer text-sm text-ink/60">
            SEO de esta página (opcional)
          </summary>
          <div className="mt-3 space-y-2">
            <label className="block text-sm">
              <span className="mb-1 block text-ink/60">
                Título para buscadores (vacío = usa el nombre)
              </span>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
              />
              <CharCounter value={seoTitle} max={60} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink/60">
                Descripción para buscadores (vacío = se arma sola con las marcas)
              </span>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
              />
              <CharCounter value={seoDescription} max={160} />
            </label>
          </div>
        </details>

        <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Marcas (aparecen al pasar el mouse en /work)
        </h3>

        {kind === "listing" ? (
          <p className="mb-6 rounded-md border border-dashed border-black/15 bg-[#faf9f6] p-3 text-sm text-ink/60">
            En una categoría con casos propios, la lista de marcas se arma sola a partir de
            los <strong>casos</strong> de abajo (mismo orden) — no hace falta escribir cada
            marca dos veces. Para agregar, renombrar o reordenar una marca, hacelo en su caso.
            {clients.length > 0 && (
              <span className="mt-2 block text-ink/40">Actual: {clients.join(", ")}</span>
            )}
          </p>
        ) : (
          <>
            <ul className="mb-3 space-y-2">
              {clients.map((client, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    value={client}
                    onChange={(e) =>
                      setClients((list) => list.map((c, idx) => (idx === i ? e.target.value : c)))
                    }
                    className="flex-1 rounded-md border border-black/15 px-3 py-1.5 text-sm outline-none focus:border-ink/40"
                  />
                  <button
                    type="button"
                    onClick={() => setClients((list) => move(list, i, i - 1))}
                    disabled={i === 0}
                    className="rounded px-2 py-1 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => setClients((list) => move(list, i, i + 1))}
                    disabled={i === clients.length - 1}
                    className="rounded px-2 py-1 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setClients((list) => list.filter((_, idx) => idx !== i))}
                    className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
            <div className="mb-6 flex gap-2">
              <input
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="Nombre de la marca"
                className="flex-1 rounded-md border border-black/15 px-3 py-1.5 text-sm outline-none focus:border-ink/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newClient.trim()) {
                    e.preventDefault();
                    setClients((list) => [...list, newClient.trim()]);
                    setNewClient("");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!newClient.trim()) return;
                  setClients((list) => [...list, newClient.trim()]);
                  setNewClient("");
                }}
                className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:border-black/30"
              >
                + Agregar
              </button>
            </div>
          </>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
          {savedAt && <span className="text-sm text-green-600">Guardado ✓</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </section>

      {/* --- Cases with their own page — only "listado" categories ever
          render one (StrategyView/PendingView never show cases regardless
          of what's saved), so this section only makes sense there. Today
          that's branding only. */}
      {kind === "listing" && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
              Casos con página propia
            </h2>
            <Link
              href={`/admin/work/${category.slug}/new`}
              className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-white"
            >
              + Nuevo caso
            </Link>
          </div>

          {caseList.length === 0 ? (
            <p className="rounded-lg border border-dashed border-black/15 p-6 text-sm text-ink/40">
              Todavía no hay casos con página propia en esta categoría.
            </p>
          ) : (
            <ul className="divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
              {caseList.map((c, i) => (
                <li key={c.slug} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-8 text-xs text-ink/40">[{c.index}]</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-ink/50">
                      {c.client} · {c.year} · v{c.version}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => reorderCase(i, i - 1)}
                    disabled={i === 0}
                    className="rounded px-2 py-1 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => reorderCase(i, i + 1)}
                    disabled={i === caseList.length - 1}
                    className="rounded px-2 py-1 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
                  >
                    ↓
                  </button>
                  <Link
                    href={`/admin/work/${category.slug}/${c.slug}`}
                    className="rounded-md border border-black/15 px-3 py-1.5 text-xs hover:border-black/30"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteCase(c.slug)}
                    className="rounded-md px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
