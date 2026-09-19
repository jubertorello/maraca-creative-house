"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cldOptimize } from "@/lib/cloudinary-url";
import type { MediaUsage } from "@/lib/media-usage";

export type GalleryItem = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  createdAt: string;
  usage: MediaUsage[];
};

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type UseFilter = "all" | "used" | "unused";
type TypeFilter = "all" | "image" | "video";

export default function MediaGalleryManager({ items: initial }: { items: GalleryItem[] }) {
  const [items, setItems] = useState(initial);
  const [useFilter, setUseFilter] = useState<UseFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usedCount = items.filter((i) => i.usage.length > 0).length;
  const unusedCount = items.length - usedCount;
  const imageCount = items.filter((i) => i.resourceType === "image").length;
  const videoCount = items.filter((i) => i.resourceType === "video").length;

  const filtered = useMemo(() => {
    return items
      .filter((i) => {
        if (useFilter === "used") return i.usage.length > 0;
        if (useFilter === "unused") return i.usage.length === 0;
        return true;
      })
      .filter((i) => typeFilter === "all" || i.resourceType === typeFilter);
  }, [items, useFilter, typeFilter]);

  async function handleDelete(item: GalleryItem) {
    if (item.usage.length > 0) return; // guarded in the UI too, but belt and suspenders
    if (
      !confirm(
        `¿Eliminar este archivo de Cloudinary? No se puede deshacer.\n\n${item.publicId}`,
      )
    ) {
      return;
    }
    setDeleting(item.publicId);
    setError(null);
    const res = await fetch(
      `/api/admin/media/${encodeURIComponent(item.publicId)}?resourceType=${item.resourceType}&url=${encodeURIComponent(item.url)}`,
      { method: "DELETE" },
    );
    setDeleting(null);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo eliminar. Probá de nuevo.");
      return;
    }
    setItems((list) => list.filter((i) => i.publicId !== item.publicId));
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-medium">Galería de archivos</h1>
      <p className="mb-6 text-sm text-ink/50">
        Todo lo que se subió a Cloudinary, en un solo lugar. Los archivos en uso no se pueden
        eliminar desde acá — primero hay que quitarlos de donde se usan.
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        {(
          [
            ["all", `Todos (${items.length})`],
            ["used", `En uso (${usedCount})`],
            ["unused", `Sin usar (${unusedCount})`],
          ] as [UseFilter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setUseFilter(key)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              useFilter === key
                ? "border-ink bg-ink text-white"
                : "border-black/15 text-ink/60 hover:border-black/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        {(
          [
            ["all", `Todo tipo (${items.length})`],
            ["image", `Imágenes (${imageCount})`],
            ["video", `Videos (${videoCount})`],
          ] as [TypeFilter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTypeFilter(key)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              typeFilter === key
                ? "border-ink bg-ink text-white"
                : "border-black/15 text-ink/60 hover:border-black/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-black/15 p-6 text-sm text-ink/40">
          No hay archivos en esta vista.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((item) => {
            const inUse = item.usage.length > 0;
            const isExpanded = expanded === item.publicId;
            return (
              <div
                key={item.publicId}
                className="overflow-hidden rounded-lg border border-black/10 bg-white"
              >
                <div className="relative aspect-square bg-[#f4f4ef]">
                  {item.resourceType === "video" ? (
                    <video
                      src={cldOptimize(item.url)}
                      muted
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cldOptimize(item.url)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      inUse ? "bg-ink/80 text-white" : "bg-white/90 text-ink/60"
                    }`}
                  >
                    {inUse ? `En uso · ${item.usage.length}` : "Sin usar"}
                  </span>
                </div>

                <div className="p-2.5">
                  <p className="truncate text-[11px] text-ink/40" title={item.publicId}>
                    {item.publicId.split("/").pop()}
                  </p>
                  <p className="mb-2 text-[10px] text-ink/30">
                    {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                    {formatBytes(item.bytes)}
                  </p>

                  {inUse ? (
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : item.publicId)}
                      className="w-full rounded-md border border-black/15 px-2 py-1.5 text-[11px] hover:border-black/30"
                    >
                      {isExpanded ? "Ocultar" : "Ver dónde se usa"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.publicId}
                      className="w-full rounded-md px-2 py-1.5 text-[11px] text-red-600 hover:bg-red-50 disabled:opacity-40"
                    >
                      {deleting === item.publicId ? "Eliminando…" : "Eliminar"}
                    </button>
                  )}

                  {isExpanded && (
                    <ul className="mt-2 space-y-1 border-t border-black/10 pt-2">
                      {item.usage.map((u, i) => (
                        <li key={i}>
                          <Link
                            href={u.href}
                            className="block text-[11px] text-ink/60 underline decoration-dotted hover:text-red"
                          >
                            {u.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
