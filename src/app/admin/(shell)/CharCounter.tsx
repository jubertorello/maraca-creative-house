"use client";

/** Small "42/60" counter under an SEO field — Google truncates titles
 * around ~60 characters and descriptions around ~160 in search results, so
 * this warns (doesn't block) once you're past the safe length. */
export default function CharCounter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={`mt-0.5 block text-right text-[11px] ${over ? "text-red-600" : "text-ink/30"}`}>
      {value.length}/{max}
    </span>
  );
}
