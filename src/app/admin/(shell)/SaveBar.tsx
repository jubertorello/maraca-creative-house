"use client";

/** Fixed to the bottom of the viewport (not the end of the form) so it's
 * always reachable without scrolling past every field first — especially
 * on long pages like About or Team. Every content editor uses this same
 * bar instead of its own end-of-form button. */
export default function SaveBar({
  saving,
  savedAt,
  error,
  onSave,
}: {
  saving: boolean;
  savedAt: number | null;
  error: string | null;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-[#f4f4ef]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        {savedAt && <span className="text-sm text-green-600">Guardado ✓</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
