/**
 * Landing hero — Figma "Landing entera" > Hero (5:8), 1440×900.
 * Full-bleed looping video below the sticky charcoal navbar.
 * Source: /public/media/hero.mp4 ("WEB MARACA.mp4").
 */
export default function HeroVideo() {
  return (
    <section className="relative -mt-20 h-[100svh] min-h-[560px] w-full overflow-hidden bg-charcoal md:-mt-[120px]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/media/hero.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
