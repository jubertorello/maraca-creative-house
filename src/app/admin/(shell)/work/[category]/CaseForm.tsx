"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  CaseBlock,
  CaseStudy,
  CopyParagraph,
  MediaBlock,
} from "@/lib/work";
import MediaUrlInput from "../../MediaUrlInput";
import CharCounter from "../../CharCounter";

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}


function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const RATIOS = ["square", "portrait", "landscape"] as const;

/* ------------------------------------------------------------- v1 gallery --- */

const GALLERY_SLOTS = 8;

/** v1's page (GalleryLayout in CaseStudyView.tsx) is a fixed Figma canvas:
 * one lead text, one body text, and exactly 8 photo slots at fixed
 * positions (big hero, small pairs, stacked pair, tall strip). There's
 * only one shape for this content — not a free list — so this editor
 * mirrors that exactly: 2 fixed text fields + 8 fixed image/video slots,
 * nothing addable or removable, no reordering. An empty slot just stays
 * empty on the page (see the Tile empty state in CaseStudyView.tsx) rather
 * than needing to be deleted. */
function V1ContentEditor({
  leadEs,
  leadEn,
  bodyEs,
  bodyEn,
  images,
  onLeadEs,
  onLeadEn,
  onBodyEs,
  onBodyEn,
  onImagesChange,
}: {
  leadEs: string;
  leadEn: string;
  bodyEs: string;
  bodyEn: string;
  images: MediaBlock[];
  onLeadEs: (v: string) => void;
  onLeadEn: (v: string) => void;
  onBodyEs: (v: string) => void;
  onBodyEn: (v: string) => void;
  onImagesChange: (m: MediaBlock[]) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-black/10 bg-[#faf9f6] p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">
          Texto destacado
        </p>
        <div className="space-y-2">
          <textarea
            value={leadEs}
            onChange={(e) => onLeadEs(e.target.value)}
            placeholder="Texto en español"
            rows={3}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <textarea
            value={leadEn}
            onChange={(e) => onLeadEn(e.target.value)}
            placeholder="Text in English"
            rows={3}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </div>
      </div>

      <div className="rounded-lg border border-black/10 bg-[#faf9f6] p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">
          Texto de cuerpo
        </p>
        <div className="space-y-2">
          <textarea
            value={bodyEs}
            onChange={(e) => onBodyEs(e.target.value)}
            placeholder="Texto en español"
            rows={3}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <textarea
            value={bodyEn}
            onChange={(e) => onBodyEn(e.target.value)}
            placeholder="Text in English"
            rows={3}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/40">
          Fotos (8 posiciones fijas de la página)
        </p>
        <p className="mb-3 text-xs text-ink/40">
          Cada posición es un lugar exacto del diseño: 1 y 2 el par chico de arriba, 3 la
          foto grande, 4 y 5 el par chico del medio, 6 y 7 el par apilado, 8 la tira alta de
          la derecha. Una posición sin foto queda vacía en la página — no hace falta
          completarlas todas.
        </p>
        <div className="space-y-3">
          {images.map((m, i) => (
            <div key={i} className="rounded-lg border border-black/10 bg-[#faf9f6] p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">
                Posición {i + 1}
              </p>
              <MediaEditor
                media={m}
                onChange={(nm) => onImagesChange(images.map((x, idx) => (idx === i ? nm : x)))}
                hideRatio
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- layout (v2/v3) --- */

function ParagraphEditor({
  paragraphs,
  onChange,
}: {
  paragraphs: CopyParagraph[];
  onChange: (p: CopyParagraph[]) => void;
}) {
  const update = (i: number, p: CopyParagraph) =>
    onChange(paragraphs.map((x, idx) => (idx === i ? p : x)));

  return (
    <div className="space-y-2">
      {paragraphs.map((p, i) => (
        <div key={i} className="rounded-md border border-black/10 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs text-ink/50">
              <input
                type="checkbox"
                checked={p.emphasis ?? false}
                onChange={(e) => update(i, { ...p, emphasis: e.target.checked || undefined })}
              />
              Destacado (rojo)
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onChange(move(paragraphs, i, i - 1))}
                disabled={i === 0}
                className="rounded px-2 py-0.5 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onChange(move(paragraphs, i, i + 1))}
                disabled={i === paragraphs.length - 1}
                className="rounded px-2 py-0.5 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onChange(paragraphs.filter((_, idx) => idx !== i))}
                className="rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </div>
          <textarea
            value={p.content.es}
            onChange={(e) => update(i, { ...p, content: { ...p.content, es: e.target.value } })}
            placeholder="Párrafo en español"
            rows={2}
            className="mb-2 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
          <textarea
            value={p.content.en}
            onChange={(e) => update(i, { ...p, content: { ...p.content, en: e.target.value } })}
            placeholder="Paragraph in English"
            rows={2}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...paragraphs, { content: { es: "", en: "" } }])}
        className="rounded-md border border-black/15 px-3 py-1.5 text-xs hover:border-black/30"
      >
        + Agregar párrafo
      </button>
    </div>
  );
}

function MediaEditor({
  media,
  onChange,
  onRemove,
  hideRatio = false,
}: {
  media: MediaBlock;
  onChange: (m: MediaBlock) => void;
  onRemove?: () => void;
  /** The v1 gallery's 8 slots each have a fixed shape baked into the page
   * design (the big hero, the small pairs, the tall strip…) — the crop is
   * decided by which slot a photo is in, not by a per-image setting, so
   * this hides the ratio picker there (still shown for v2/v3, where the
   * media genuinely renders at a flexible size and the ratio matters). */
  hideRatio?: boolean;
}) {
  return (
    <div className="rounded-md border border-black/10 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <select
          value={media.type}
          onChange={(e) =>
            onChange(
              e.target.value === "video"
                ? { type: "video", src: undefined, poster: undefined }
                : { type: "image", src: undefined, ratio: "landscape" },
            )
          }
          className="rounded-md border border-black/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-ink/40"
        >
          <option value="image">Imagen</option>
          <option value="video">Video</option>
        </select>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
          >
            Eliminar
          </button>
        )}
      </div>
      <div className="mb-2">
        <MediaUrlInput
          value={media.src ?? ""}
          onChange={(url) => onChange({ ...media, src: url || undefined })}
          placeholder={media.type === "video" ? "URL del video" : "URL de la imagen"}
          accept={media.type === "video" ? "video/*" : "image/*"}
        />
      </div>
      {media.type === "image" ? (
        hideRatio ? null : (
          <select
            value={media.ratio ?? "landscape"}
            onChange={(e) => onChange({ ...media, ratio: e.target.value as (typeof RATIOS)[number] })}
            className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink/40"
          >
            {RATIOS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )
      ) : (
        <input
          value={media.poster ?? ""}
          onChange={(e) => onChange({ ...media, poster: e.target.value || undefined })}
          placeholder="URL del poster (opcional)"
          className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
        />
      )}
    </div>
  );
}

function LayoutEditor({
  columns,
  media,
  secondaryMedia,
  onColumnsChange,
  onMediaChange,
  onSecondaryChange,
}: {
  columns: CopyParagraph[][];
  media: MediaBlock;
  secondaryMedia: MediaBlock[];
  onColumnsChange: (c: CopyParagraph[][]) => void;
  onMediaChange: (m: MediaBlock) => void;
  onSecondaryChange: (m: MediaBlock[]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
          Columnas de texto
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {columns.map((col, ci) => (
            <div key={ci} className="rounded-lg border border-black/10 bg-[#faf9f6] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-ink/40">Columna {ci + 1}</span>
                {columns.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onColumnsChange(columns.filter((_, i) => i !== ci))}
                    className="rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    Eliminar columna
                  </button>
                )}
              </div>
              <ParagraphEditor
                paragraphs={col}
                onChange={(p) => onColumnsChange(columns.map((c, i) => (i === ci ? p : c)))}
              />
            </div>
          ))}
        </div>
        {columns.length < 2 && (
          <button
            type="button"
            onClick={() => onColumnsChange([...columns, []])}
            className="mt-3 rounded-md border border-black/15 px-3 py-1.5 text-xs hover:border-black/30"
          >
            + Agregar columna
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
          Media principal
        </p>
        <MediaEditor media={media} onChange={onMediaChange} />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
          Media secundaria (fila de imágenes/videos debajo)
        </p>
        <div className="space-y-2">
          {secondaryMedia.map((m, i) => (
            <MediaEditor
              key={i}
              media={m}
              onChange={(nm) => onSecondaryChange(secondaryMedia.map((x, idx) => (idx === i ? nm : x)))}
              onRemove={() => onSecondaryChange(secondaryMedia.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => onSecondaryChange([...secondaryMedia, { type: "image", ratio: "landscape" }])}
          className="mt-2 rounded-md border border-black/15 px-3 py-1.5 text-xs hover:border-black/30"
        >
          + Agregar media secundaria
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- main form --- */

export default function CaseForm({
  categorySlug,
  initial,
  nextIndex,
}: {
  categorySlug: string;
  initial?: CaseStudy;
  nextIndex: string;
}) {
  const router = useRouter();
  const isNew = !initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [client, setClient] = useState(initial?.client ?? "");
  const [year, setYear] = useState(initial?.year ?? String(new Date().getFullYear()));
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [version, setVersion] = useState<1 | 2 | 3>(initial?.version ?? 1);
  const [areaRatio, setAreaRatio] = useState(initial?.area?.ratio ?? "landscape");
  const [areaImage, setAreaImage] = useState(initial?.area?.image ?? "");
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");
  const initialTexts = initial?.blocks.filter(
    (b): b is Extract<CaseBlock, { type: "text" }> => b.type === "text",
  );
  const initialLead = initialTexts?.find((b) => b.variant === "lead");
  const initialBody = initialTexts?.find((b) => b.variant === "body");
  const initialImages = (initial?.blocks.filter(
    (b): b is MediaBlock => b.type === "image" || b.type === "video",
  ) ?? []).slice(0, GALLERY_SLOTS);

  const [leadEs, setLeadEs] = useState(initialLead?.content.es ?? "");
  const [leadEn, setLeadEn] = useState(initialLead?.content.en ?? "");
  const [bodyEs, setBodyEs] = useState(initialBody?.content.es ?? "");
  const [bodyEn, setBodyEn] = useState(initialBody?.content.en ?? "");
  const [images, setImages] = useState<MediaBlock[]>(
    Array.from(
      { length: GALLERY_SLOTS },
      (_, i): MediaBlock => initialImages[i] ?? { type: "image" },
    ),
  );
  const [columns, setColumns] = useState<CopyParagraph[][]>(
    initial?.layout?.columns ?? [[]],
  );
  const [media, setMedia] = useState<MediaBlock>(
    initial?.layout?.media ?? { type: "video" },
  );
  const [secondaryMedia, setSecondaryMedia] = useState<MediaBlock[]>(
    initial?.layout?.secondaryMedia ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !client.trim() || !slug.trim()) {
      setError("Completá al menos título, cliente y slug.");
      return;
    }
    setSaving(true);
    setError(null);

    const body: CaseStudy = {
      category: categorySlug as CaseStudy["category"],
      slug: slug.trim(),
      title: title.trim(),
      client: client.trim(),
      year: year.trim(),
      index: initial?.index ?? nextIndex,
      version,
      area: { ratio: areaRatio, image: areaImage.trim() || undefined },
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      blocks:
        version === 1
          ? [
              { type: "text", variant: "lead", content: { es: leadEs, en: leadEn } },
              { type: "text", variant: "body", content: { es: bodyEs, en: bodyEn } },
              ...images,
            ]
          : [
              { type: "text", variant: "lead", content: { es: leadEs, en: leadEn } },
              media,
              ...secondaryMedia,
            ],
      ...(version !== 1
        ? { layout: { columns: columns.filter((c) => c.length > 0), media, secondaryMedia } }
        : {}),
    };

    const res = await fetch("/api/admin/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      setError("No se pudo guardar. Revisá los datos.");
      return;
    }
    router.push(`/admin/work/${categorySlug}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSave} className="space-y-8">
      <Link
        href={`/admin/work/${categorySlug}`}
        className="mb-2 inline-block text-sm text-ink/50 hover:text-ink"
      >
        ← {categorySlug}
      </Link>

      <section className="rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Datos básicos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Título del caso</span>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className="w-full rounded-md border border-black/15 px-3 py-2 outline-none focus:border-ink/40"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Cliente / marca</span>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full rounded-md border border-black/15 px-3 py-2 outline-none focus:border-ink/40"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Año</span>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-md border border-black/15 px-3 py-2 outline-none focus:border-ink/40"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Slug (URL)</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
              }}
              disabled={!isNew}
              className="w-full rounded-md border border-black/15 px-3 py-2 outline-none focus:border-ink/40 disabled:bg-black/5 disabled:text-ink/40"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Diseño (versión)</span>
            <select
              value={version}
              onChange={(e) => setVersion(Number(e.target.value) as 1 | 2 | 3)}
              className="w-full rounded-md border border-black/15 bg-white px-3 py-2 outline-none focus:border-ink/40"
            >
              <option value={1}>v1 — Galería (KISH&amp;GO)</option>
              <option value={2}>v2 — 2 columnas + video (Natuka)</option>
              <option value={3}>v3 — 1 columna + video (VB Group)</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink/60">Formato de la miniatura</span>
            <select
              value={areaRatio}
              onChange={(e) => setAreaRatio(e.target.value as (typeof RATIOS)[number])}
              className="w-full rounded-md border border-black/15 bg-white px-3 py-2 outline-none focus:border-ink/40"
            >
              {RATIOS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block text-ink/60">
            Imagen identificativa de la miniatura (vacío = usa la primera imagen de la
            galería)
          </span>
          <MediaUrlInput
            value={areaImage}
            onChange={setAreaImage}
            placeholder="URL de la imagen"
            accept="image/*"
          />
        </label>

        <details className="mt-4 rounded-md border border-black/10 p-3">
          <summary className="cursor-pointer text-sm text-ink/60">
            SEO de esta página (opcional)
          </summary>
          <div className="mt-3 space-y-2">
            <label className="block text-sm">
              <span className="mb-1 block text-ink/60">
                Título para buscadores (vacío = usa título + cliente)
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
                Descripción para buscadores (vacío = usa el texto destacado)
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
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Contenido
        </h2>
        {version === 1 ? (
          <V1ContentEditor
            leadEs={leadEs}
            leadEn={leadEn}
            bodyEs={bodyEs}
            bodyEn={bodyEn}
            images={images}
            onLeadEs={setLeadEs}
            onLeadEn={setLeadEn}
            onBodyEs={setBodyEs}
            onBodyEn={setBodyEn}
            onImagesChange={setImages}
          />
        ) : (
          <LayoutEditor
            columns={columns}
            media={media}
            secondaryMedia={secondaryMedia}
            onColumnsChange={setColumns}
            onMediaChange={setMedia}
            onSecondaryChange={setSecondaryMedia}
          />
        )}
      </section>

      {/* Fixed to the viewport bottom (not the end of the form) — this
          editor is long (8 media slots), so the button needs to be
          reachable without scrolling past everything first. Stays a plain
          type="submit" so it still triggers the form's onSubmit. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-[#f4f4ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {saving ? "Guardando…" : isNew ? "Crear caso" : "Guardar cambios"}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </form>
  );
}
