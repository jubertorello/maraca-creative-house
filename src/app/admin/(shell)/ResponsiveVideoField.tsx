"use client";

import type { ResponsiveVideo } from "@/lib/site-content";
import MediaUrlInput from "./MediaUrlInput";

/** Every video in the site has a desktop cut and a mobile cut — this is the
 * paired editor for both, used anywhere a ResponsiveVideo is edited. */
export default function ResponsiveVideoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ResponsiveVideo;
  onChange: (v: ResponsiveVideo) => void;
}) {
  return (
    <div className="mb-4">
      <span className="mb-1 block text-sm text-ink/60">{label}</span>
      <div className="space-y-2">
        <div>
          <span className="mb-1 block text-xs text-ink/40">Desktop</span>
          <MediaUrlInput
            value={value.desktop}
            onChange={(url) => onChange({ ...value, desktop: url })}
            placeholder="URL del video (desktop)"
            accept="video/*"
          />
        </div>
        <div>
          <span className="mb-1 block text-xs text-ink/40">
            Mobile (opcional — si no se carga, se usa el de desktop)
          </span>
          <MediaUrlInput
            value={value.mobile ?? ""}
            onChange={(url) => onChange({ ...value, mobile: url || undefined })}
            placeholder="URL del video (mobile)"
            accept="video/*"
          />
        </div>
      </div>
    </div>
  );
}
