/**
 * Inserts Cloudinary's automatic format + quality transformation into a
 * delivery URL — `f_auto` serves whichever format the visitor's browser
 * actually supports best (WebP, AVIF, ...) instead of one fixed format,
 * and `q_auto` picks a good quality/size tradeoff automatically. This is
 * Cloudinary's own recommended default and beats hard-coding "always
 * WebP" (some browsers do better with AVIF; very old ones fall back to
 * the original).
 *
 * Client-safe (no secrets) — unlike src/lib/cloudinary.ts, this can run in
 * "use client" components too. A no-op for anything that isn't a
 * Cloudinary delivery URL (local /media paths, external URLs), so it's
 * safe to wrap every image/video src with this unconditionally.
 */
export function cldOptimize(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/)(?!f_auto)/,
    "$1f_auto,q_auto/",
  );
}
