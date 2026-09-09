"use client";

import { useCallback, useEffect } from "react";
import type { MediaBlock } from "@/lib/work";
import { cldOptimize } from "@/lib/cloudinary-url";

/**
 * Fullscreen media viewer for case studies. `index` null = closed.
 */
export default function Lightbox({
  media,
  index,
  onClose,
  onIndex,
}: {
  media: MediaBlock[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const open = index !== null;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onIndex((index + dir + media.length) % media.length);
    },
    [index, media.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, go]);

  if (index === null) return null;
  const item = media[index];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/95 p-6 md:p-16"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-6 top-6 text-2xl text-cream/70 transition-colors hover:text-red"
      >
        ×
      </button>

      {media.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Anterior"
            className="absolute left-4 text-3xl text-cream/60 transition-colors hover:text-red md:left-10"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Siguiente"
            className="absolute right-4 text-3xl text-cream/60 transition-colors hover:text-red md:right-10"
          >
            ›
          </button>
        </>
      )}

      <div
        className="max-h-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "video" ? (
          <video
            src={cldOptimize(item.src)}
            controls
            autoPlay
            loop
            className="max-h-[80vh] w-auto bg-charcoal"
          />
        ) : item.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cldOptimize(item.src)}
            alt=""
            className="max-h-[80vh] w-auto object-contain"
          />
        ) : (
          <div className="aspect-video w-[80vw] max-w-3xl bg-cream/10" />
        )}
      </div>

      {media.length > 1 && (
        <span className="absolute bottom-6 text-xs tabular-nums text-cream/50">
          {index + 1} / {media.length}
        </span>
      )}
    </div>
  );
}
