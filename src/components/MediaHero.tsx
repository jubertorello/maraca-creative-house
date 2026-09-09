import Image from "next/image";
import type { ResponsiveVideo } from "@/lib/site-content";
import ResponsiveVideoSources from "@/components/ResponsiveVideoSources";

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
  return (
    <section
      className={`relative -mt-20 h-[100svh] min-h-[520px] w-full overflow-hidden md:-mt-[120px] ${className}`}
    >
      {kind === "video" && props.video && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
        >
          <ResponsiveVideoSources video={props.video} />
        </video>
      )}
      {kind === "image" && props.src && (
        <Image src={props.src} alt={alt} fill priority className="object-cover" />
      )}
    </section>
  );
}
