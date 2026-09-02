import Image from "next/image";

/**
 * Full-bleed page hero that sits below the sticky navbar.
 * Pass `src` once the real asset exists in /public/media/*; until then it
 * renders the coloured block alone (matches the Figma hero fills).
 */
type MediaHeroProps = {
  kind: "video" | "image";
  src?: string;
  poster?: string;
  alt?: string;
  /** Tailwind bg utility for the empty/loading state — e.g. "bg-sky". */
  className?: string;
};

export default function MediaHero({
  kind,
  src,
  poster,
  alt = "",
  className = "bg-charcoal",
}: MediaHeroProps) {
  return (
    <section
      className={`relative -mt-20 h-[100svh] min-h-[520px] w-full overflow-hidden md:-mt-[120px] ${className}`}
    >
      {src && kind === "video" && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
      {src && kind === "image" && (
        <Image src={src} alt={alt} fill priority className="object-cover" />
      )}
    </section>
  );
}
