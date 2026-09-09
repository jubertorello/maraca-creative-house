"use client";

import { useEffect, useRef, useState } from "react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

type CloudinaryResult = { event: string; info?: { secure_url?: string } };

type CloudinaryWidget = { open: () => void; destroy: () => void };

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: CloudinaryResult) => void,
      ) => CloudinaryWidget;
    };
  }
}

/** Opens the real Cloudinary Upload Widget (drag & drop, camera, crop,
 * progress — not just a bare file input) using a signed upload, so the API
 * secret never reaches the browser: the widget asks our server to sign
 * each upload via /api/admin/upload-signature.
 *
 * The widget script itself is loaded once, in the admin shell layout — this
 * component just polls for `window.cloudinary` to appear, which works
 * correctly no matter how many of these render on the page or in what
 * order (a per-instance <Script onReady> only reliably fires once). */
export default function CloudinaryUploadButton({
  onUploaded,
  accept,
  label = "Subir",
}: {
  onUploaded: (url: string) => void;
  accept: "image" | "video";
  label?: string;
}) {
  const [scriptReady, setScriptReady] = useState(
    typeof window !== "undefined" && Boolean(window.cloudinary),
  );
  const widgetRef = useRef<CloudinaryWidget | null>(null);

  useEffect(() => {
    if (scriptReady) return;
    const id = setInterval(() => {
      if (window.cloudinary) {
        setScriptReady(true);
        clearInterval(id);
      }
    }, 200);
    return () => clearInterval(id);
  }, [scriptReady]);

  function openWidget() {
    if (!window.cloudinary || !CLOUD_NAME || !API_KEY) return;

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          apiKey: API_KEY,
          uploadSignature: async (
            callback: (signature: string) => void,
            paramsToSign: Record<string, unknown>,
          ) => {
            const res = await fetch("/api/admin/upload-signature", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paramsToSign }),
            });
            const { signature } = await res.json();
            callback(signature);
          },
          folder: "maraca",
          resourceType: accept,
          multiple: false,
          // Cloudinary's own "media_library" source needs the editor to log
          // into a real Cloudinary account inside the widget — not
          // something to hand out just to re-pick a photo. Picking an
          // already-uploaded file instead goes through our own library
          // picker (MediaLibraryPicker), gated by the same admin login.
          sources: ["local", "url", "camera"],
          styles: {
            palette: {
              window: "#F4F4EF",
              windowBorder: "#1A1A1B",
              tabIcon: "#1A1A1B",
              menuIcons: "#1A1A1B",
              textDark: "#1A1A1B",
              textLight: "#FFFFFF",
              link: "#1A1A1B",
              action: "#B4282D",
              inactiveTabIcon: "#8b8b88",
              error: "#B4282D",
              inProgress: "#1A1A1B",
              complete: "#1A1A1B",
              sourceBg: "#FFFFFF",
            },
          },
        },
        (error, result) => {
          if (!error && result?.event === "success" && result.info?.secure_url) {
            onUploaded(result.info.secure_url);
          }
        },
      );
    }

    widgetRef.current.open();
  }

  if (!CLOUD_NAME || !API_KEY) {
    return (
      <span className="flex shrink-0 items-center rounded-md border border-black/10 px-3 py-2 text-xs text-ink/30">
        Cloudinary no conectado
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={openWidget}
      disabled={!scriptReady}
      className="flex shrink-0 items-center rounded-md border border-black/15 px-3 py-2 text-xs hover:border-black/30 disabled:opacity-40"
    >
      {scriptReady ? label : "Cargando…"}
    </button>
  );
}
