"use client";

import { useState } from "react";
import MediaThumbnail from "./MediaThumbnail";
import CloudinaryUploadButton from "./CloudinaryUploadButton";
import MediaLibraryPicker from "./MediaLibraryPicker";

/** Thumbnail preview + upload button, with the raw URL tucked behind a
 * toggle instead of front and center — you see the image/video itself, not
 * a Cloudinary link, which is what actually tells you what's loaded there.
 * The URL is still there (and still directly editable/pasteable) for the
 * rare case you need it. */
export default function MediaUrlInput({
  value,
  onChange,
  placeholder,
  accept,
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder: string;
  accept: "image/*" | "video/*";
}) {
  const [showUrl, setShowUrl] = useState(false);
  const kind = accept === "video/*" ? "video" : "image";

  return (
    <div>
      <div className="flex items-center gap-3">
        <MediaThumbnail url={value} kind={kind} />
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <CloudinaryUploadButton onUploaded={onChange} accept={kind} />
          <MediaLibraryPicker accept={kind} onSelect={onChange} />
          <button
            type="button"
            onClick={() => setShowUrl((s) => !s)}
            className="text-xs text-ink/40 underline decoration-dotted hover:text-ink/70"
          >
            {showUrl ? "Ocultar URL" : "Pegar/editar URL"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-red-600 hover:underline"
            >
              Quitar
            </button>
          )}
        </div>
      </div>
      {showUrl && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full rounded-md border border-black/15 px-3 py-1.5 font-mono text-xs text-ink/70 outline-none focus:border-ink/40"
        />
      )}
    </div>
  );
}
