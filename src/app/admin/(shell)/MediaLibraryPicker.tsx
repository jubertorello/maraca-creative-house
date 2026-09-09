"use client";

import { useEffect, useState } from "react";
import { cldOptimize } from "@/lib/cloudinary-url";

type Item = { url: string; publicId: string; width?: number; height?: number };

/** "Elegir ya subida" — browses what's already in Cloudinary (via our own
 * admin-authenticated API, not Cloudinary's own login-gated Media Library
 * widget) and lets you pick one instead of uploading a duplicate. */
export default function MediaLibraryPicker({
  accept,
  onSelect,
}: {
  accept: "image" | "video";
  onSelect: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || items !== null) return;
    fetch(`/api/admin/media?type=${accept}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setItems(data.items))
      .catch(() => setError("No se pudo cargar la biblioteca de Cloudinary."));
  }, [open, items, accept]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center rounded-md border border-black/15 px-3 py-2 text-xs hover:border-black/30"
      >
        Elegir ya subida
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-[#f4f4ef] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">
                Elegir {accept === "video" ? "video" : "imagen"} ya subida
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-ink/50 hover:text-ink"
              >
                Cerrar
              </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {!error && items === null && (
              <p className="text-sm text-ink/40">Cargando…</p>
            )}
            {items && items.length === 0 && (
              <p className="text-sm text-ink/40">Todavía no subiste nada de este tipo.</p>
            )}
            {items && items.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {items.map((item) => (
                  <button
                    key={item.publicId}
                    type="button"
                    onClick={() => {
                      onSelect(item.url);
                      setOpen(false);
                    }}
                    className="aspect-square overflow-hidden rounded-md border border-black/10 bg-white transition-opacity hover:opacity-70"
                  >
                    {accept === "video" ? (
                      <video src={cldOptimize(item.url)} muted className="h-full w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cldOptimize(item.url)} alt="" className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
