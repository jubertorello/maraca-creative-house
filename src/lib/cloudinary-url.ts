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

/**
 * Forces real MP4 delivery for a video — unlike `cldOptimize`'s `f_auto`
 * (which is fine for a plain `<video src>` with no declared type, since the
 * browser just trusts whatever Content-Type the response actually comes
 * back with), this is for `<source type="video/mp4">` specifically: a
 * hard-coded `type` attribute makes the browser trust *that* over the
 * actual file, so any upload that isn't already a real .mp4 (a .mov
 * straight from a phone or Premiere, say — Cloudinary happily stores and
 * serves those with a `video/quicktime` Content-Type unless told
 * otherwise) gets silently rejected or half-decoded by browsers that take
 * the declared type at face value, which shows up as "the video looks
 * broken/blurry" — the file's fine, the browser just never decoded it
 * properly. `f_mp4` transcodes to an actual MP4 container on the fly so
 * the bytes always match what the `type` attribute promises.
 */
export function cldVideoMp4(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(?!f_mp4)/,
    "$1f_mp4,q_auto/",
  );
}
