"use client";

import { useRef } from "react";
import Image from "next/image";
import type { ResponsiveVideo } from "@/lib/site-content";
import ResponsiveVideoSources from "@/components/ResponsiveVideoSources";
import { useVideoSourceFix } from "@/lib/useVideoSourceFix";
import { cldVideoPoster } from "@/lib/cloudinary-url";

/**
 * Full-bleed page hero that sits below the sticky navbar.
 * Pass `src`/`video` once the real asset exists; until then it renders the
 * coloured block alone (matches the Figma hero fills).
 */
type MediaHeroProps =
  | {
      kind: "video";
      video?: ResponsiveVideo;
      poster?: string;
      alt?: string;
      className?: string;
      /** On mobile, keep the video at its own (landscape) aspect ratio
       * instead of stretching/cropping it to fill the full viewport height
       * — for footage that only makes sense horizontal (e.g. Team's
       * montage), object-cover-ing it into a tall narrow box on mobile
       * crops away most of the frame. Desktop is unaffected either way. */
      lockLandscapeOnMobile?: boolean;
    }
  | {
      kind: "image";
      src?: string;
      poster?: string;
      alt?: string;
      className?: string;
    };

export default function MediaHero(props: MediaHeroProps) {
  const { kind, poster, alt = "", className = "bg-charcoal" } = props;
  const lockLandscapeOnMobile = kind === "video" && props.lockLandscapeOnMobile;
  const videoRef = useRef<HTMLVideoElement>(null);
  useVideoSourceFix(videoRef);
  const posterDesktop = kind === "video" ? cldVideoPoster(props.video?.desktop) : undefined;
  const posterMobile =
    kind === "video" && props.video?.mobile ? cldVideoPoster(props.video.mobile, 750) : undefined;

  return (
    <section
      className={`relative -mt-20 w-full overflow-hidden md:-mt-[120px] md:h-[100svh] md:min-h-[520px] ${
        lockLandscapeOnMobile ? "aspect-video h-auto" : "h-[100svh] min-h-[520px]"
      } ${className}`}
    >
      {kind === "video" && props.video && (
        <>
          {/* First-frame stills behind the video (one per cut, switched by
              breakpoint like the video sources) so a picture shows right
              away while the video buffers instead of a blank colour block. */}
          {posterMobile && (
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center md:hidden"
              style={{ backgroundImage: `url(${posterMobile})` }}
            />
          )}
          {posterDesktop && (
            <div
              aria-hidden
              className={`absolute inset-0 bg-cover bg-center ${posterMobile ? "hidden md:block" : ""}`}
              style={{ backgroundImage: `url(${posterDesktop})` }}
            />
          )}
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={poster}
          >
            <ResponsiveVideoSources video={props.video} />
          </video>
        </>
      )}
      {kind === "image" && props.src && (
        <Image src={props.src} alt={alt} fill priority className="object-cover" />
      )}
    </section>
  );
}
