import type { ResponsiveVideo } from "@/lib/site-content";

/** Two <source> tags — the browser picks whichever `media` query matches,
 * natively, no JS. Drop this inside any <video>. Mobile falls back to the
 * desktop cut when a separate one hasn't been set yet. */
export default function ResponsiveVideoSources({ video }: { video: ResponsiveVideo }) {
  return (
    <>
      <source media="(max-width: 767px)" src={video.mobile ?? video.desktop} type="video/mp4" />
      <source src={video.desktop} type="video/mp4" />
    </>
  );
}
