import type { ResponsiveVideo } from "@/lib/site-content";
import { cldVideoMp4 } from "@/lib/cloudinary-url";

/** Two <source> tags — the browser picks whichever `media` query matches,
 * natively, no JS. Drop this inside any <video>. Mobile falls back to the
 * desktop cut when a separate one hasn't been set yet.
 *
 * `type="video/mp4"` is a promise to the browser about the bytes it's
 * about to fetch — `cldVideoMp4` makes sure that's actually true even when
 * what got uploaded was a .mov, which some browsers otherwise fail to
 * decode despite the file being perfectly fine (see its own comment). */
export default function ResponsiveVideoSources({ video }: { video: ResponsiveVideo }) {
  return (
    <>
      <source
        media="(max-width: 767px)"
        src={cldVideoMp4(video.mobile ?? video.desktop)}
        type="video/mp4"
      />
      <source src={cldVideoMp4(video.desktop)} type="video/mp4" />
    </>
  );
}
