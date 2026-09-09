"use client";

import { useRef } from "react";
import { cldOptimize } from "@/lib/cloudinary-url";

/** Small visual preview for a media URL — an actual thumbnail instead of
 * making the editor read a Cloudinary URL to know what's there. Images
 * render as a static thumbnail; videos show their first frame as a poster
 * and only play on hover (playing every video thumbnail on a page at once —
 * e.g. the 30-row Marcas list — is unnecessary decoding work). */
export default function MediaThumbnail({
  url,
  kind,
}: {
  url: string;
  kind: "image" | "video";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!url) {
    return (
      <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-black/15 bg-[#faf9f6] text-center text-[9px] leading-tight text-ink/30">
        Sin
        <br />
        archivo
      </div>
    );
  }

  if (kind === "video") {
    return (
      <video
        ref={videoRef}
        src={cldOptimize(url)}
        muted
        loop
        playsInline
        preload="metadata"
        onMouseEnter={() => videoRef.current?.play()}
        onMouseLeave={() => {
          const v = videoRef.current;
          if (!v) return;
          v.pause();
          v.currentTime = 0;
        }}
        className="h-14 w-20 shrink-0 cursor-pointer rounded-md border border-black/10 bg-black object-cover"
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- arbitrary/remote
  // admin-only thumbnail, not worth Next/Image's domain config + layout ceremony
  return (
    <img
      src={cldOptimize(url)}
      alt=""
      loading="lazy"
      className="h-14 w-20 shrink-0 rounded-md border border-black/10 bg-[#faf9f6] object-cover"
    />
  );
}
