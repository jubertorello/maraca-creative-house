import CategoryGrid from "@/components/CategoryGrid";

/**
 * "Participadas" — Figma "Landing entera" > Participadas (8:8), bg #EBEDDE.
 * Row of 6 numbered service tiles; see CategoryGrid.
 */
export default function Services() {
  return (
    <section className="bg-cream pb-[clamp(3rem,8.5vw,122px)]">
      <CategoryGrid />
    </section>
  );
}
