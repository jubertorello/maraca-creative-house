/**
 * Work — Figma structure confirmed with the user:
 *
 *   /work                     → "work general" index (6047:448): WHAT'S ON THE MENU
 *                               + the 6 category tiles.
 *   /work/[category]          → area page (6054:265 branding, 6096:1162 campañas):
 *                               "[n] CATEGORY" + editorial grid of cases; hover
 *                               brightens one and reddens its name (6129:1077).
 *   /work/[category]/[slug]   → case study — a fixed-height horizontal gallery
 *                               with a header row and ‹ › paging. Every image
 *                               opens a lightbox. Max 6 media.
 *
 * 3 publishing layouts (chosen per client in the future CMS via `version`):
 *   v1 = KISH&GO (6053:59)   — gallery-led, short text.
 *   v2 = Natuka  (6100:1282) — two text columns + big video + small images.
 *   v3 = VB Group(6109:26)   — one text column + one big video.
 * In practice the template just renders `blocks` left-to-right; `version` is
 * kept for the CMS and to seed sensible defaults.
 *
 * By explicit decision, every `branding` case is v1 (KISH&GO's design) —
 * `version: 1`, no `layout` object (that's what actually selects v2/v3 in
 * CaseStudyView, `version` alone doesn't). v2 and v3 stay implemented and in
 * use for `campanas` (Natuka, VB Group) so they're ready when needed, but
 * don't assign either to a branding case without asking first.
 *
 * Only `branding` and `campanas` are live; the other four categories show on
 * the index but don't link anywhere yet.
 */

/** Work-index hover list: show at most this many clients, then "See all". */
export const MAX_REVEAL_CLIENTS = 15;

export type CategorySlug =
  | "branding"
  | "estrategia"
  | "contenido"
  | "web"
  | "campanas"
  | "eventos";

export type Category = {
  slug: CategorySlug;
  index: string;
  name: { es: string; en: string };
  enabled: boolean;
  /** Client names revealed on hover (Work index). */
  clients: string[];
  /** "listing" (default) = area page with a grid of client cases, each with
   * its own detail page. "manifesto" = one single page for the whole
   * category (Figma "Work estrategia I", 6116:69) — clients are named but
   * none of them has its own page. "pending" = clients are named (shown on
   * hover from the Work index) but the category page itself isn't designed
   * yet — just a "Diseño pendiente" placeholder. */
  kind?: "listing" | "manifesto" | "pending";
};

export const CATEGORIES: Category[] = [
  {
    slug: "branding",
    index: "1",
    name: { es: "Branding", en: "Branding" },
    enabled: true,
    clients: [
      "Kish&Go",
      "Maruch",
      "Unrated",
      "Joia by Buccara",
      "Awake",
      "Mesonero-Romanos Studio",
      "Espacio Trimmings",
      "CarpaDiem",
      "Laberinto Studio",
      "Beatriz Ortiz Clinic",
      "Volver a Casa by Fundación Manantial",
      "Milton Education",
      "Beston",
      "Canica",
      "Natuka",
    ],
  },
  {
    slug: "estrategia",
    index: "2",
    name: {
      es: "Estrategia de comunicación y RRSS",
      en: "Communication & social media strategy",
    },
    enabled: true,
    kind: "manifesto",
    clients: [
      "Mira Miranda",
      "Gaby's Bagels",
      "Casabarré",
      "Beston",
      "Canica",
      "Mesonero Romanos Studio",
      "Beatriz Ortiz Clinic",
      "Milton Education",
      "Kish&Go",
      "Unrated",
      "Oma by Luchi",
      "Continuo Café",
    ],
  },
  {
    slug: "contenido",
    index: "3",
    name: {
      es: "Creación de contenido y shootings",
      en: "Content creation & shootings",
    },
    enabled: true,
    kind: "pending",
    clients: [
      "Baía Food",
      "Caixabank",
      "Baudesson",
      "MIM Shoes",
      "Beston",
      "Kish&Go",
      "Gaby's Bagels",
      "Oma by Luchi",
      "Continuo Café",
    ],
  },
  {
    slug: "web",
    index: "4",
    name: { es: "Diseño web", en: "Web design" },
    enabled: true,
    kind: "pending",
    clients: [
      "Corpfin Capital",
      "Beston",
      "Kish&Go",
      "Oma by Luchi",
      "Volver a Casa by Fundación Manantial",
      "Joia by Buccara",
      "Beatriz Ortiz Clinic",
      "Mesonero-Romanos Studio",
    ],
  },
  {
    slug: "campanas",
    index: "5",
    name: { es: "Campañas de publicidad", en: "Advertising campaigns" },
    enabled: true,
    kind: "pending",
    clients: [
      "Natuka",
      "VB Group",
      "Foster's Hollywood",
      "Baudesson",
      "MIM Shoes",
      "MatErh",
    ],
  },
  {
    slug: "eventos",
    index: "6",
    name: { es: "Eventos", en: "Events" },
    enabled: true,
    kind: "pending",
    clients: [
      "BBC x Bluey",
      "Beston 'Runway'",
      "Beston 'Après Ski'",
      "Beston 'Dinner'",
      "Baïa Food",
      "Baudesson 'Carnaval'",
    ],
  },
];

export const getCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

export const ENABLED_CATEGORIES = CATEGORIES.filter((c) => c.enabled);

/* ---------------------------------------------------------------- cases --- */

type Lang = { es: string; en: string };

export type CaseBlock =
  | { type: "text"; variant: "lead" | "body"; content: Lang }
  | { type: "image"; src?: string; ratio?: "square" | "portrait" | "landscape" }
  | { type: "video"; src?: string; poster?: string };

export type MediaBlock = Extract<CaseBlock, { type: "image" | "video" }>;

/** One paragraph of storytelling copy; `emphasis` = the short red-highlighted
 * lines Figma uses as callouts (6100:1281 / 6109:25). */
export type CopyParagraph = { content: Lang; emphasis?: boolean };

/** v2 (Natuka, 6100:1281) / v3 (VB Group, 6109:25): a static two-region page
 * — 1 or 2 text columns beside one big hero media, optionally followed by a
 * secondary row of smaller media (v2 only). Different shape from v1's
 * horizontal-scroll `blocks` gallery. */
export type StaticLayout = {
  columns: CopyParagraph[][];
  media: MediaBlock;
  secondaryMedia?: MediaBlock[];
};

export type CaseStudy = {
  category: CategorySlug;
  slug: string;
  title: string;
  client: string;
  year: string; // "2026"
  index: string; // "01"
  version: 1 | 2 | 3;
  /** v1 (KISH&GO-style horizontal gallery). */
  blocks: CaseBlock[];
  /** v2 / v3 static layout — present instead of relying on `blocks`. */
  layout?: StaticLayout;
  /** How this case's thumbnail renders on the /work/[category] area page —
   * always exactly one photo + [n], client name and (year) (Figma 6054:265 /
   * 6096:1162) — independent of `blocks` (the case-detail gallery). */
  area?: { ratio?: "square" | "portrait" | "landscape" };
};

const lead = (content: Lang): CaseBlock => ({ type: "text", variant: "lead", content });
const body = (content: Lang): CaseBlock => ({ type: "text", variant: "body", content });

/** Stub for a case we know the name/year of but have no content for yet. */
const stub = (
  category: CategorySlug,
  slug: string,
  title: string,
  year: string,
  index: string,
  area?: CaseStudy["area"],
): CaseStudy => ({
  category,
  slug,
  title,
  client: title,
  year,
  index,
  version: 1,
  area,
  blocks: [
    lead({ es: "Contenido pendiente.", en: "Content coming soon." }),
    { type: "image", ratio: area?.ratio ?? "landscape" },
  ],
});

export const CASES: CaseStudy[] = [
  // ---- BRANDING (6054:265, 15 projects) ---------------------------------
  {
    category: "branding",
    slug: "kish-and-go",
    title: "KISH&GO",
    client: "KISH&Go",
    year: "2026",
    index: "01",
    version: 1,
    area: { ratio: "portrait" },
    blocks: [
      lead({
        es: "Para construir la identidad de Kish&Go rompimos con lo esperado: una quiche puede tener más de un lugar de origen. La receta nace en Francia, la marca en Madrid y su creadora en Rio de Janeiro. Tres culturas, tres códigos y una misma mesa.",
        en: "To build Kish&Go's identity we broke with the expected: a quiche can have more than one place of origin. The recipe is born in France, the brand in Madrid and its founder in Rio de Janeiro. Three cultures, three codes and one table.",
      }),
      { type: "image", ratio: "portrait" },
      { type: "image", ratio: "square" },
      body({
        es: "A partir de ahí, llevamos esa mezcla al lenguaje visual. Las ondas del paseo de las aceras de Rio se convierten en un recurso gráfico que conecta la identidad con el origen de su creadora, mientras una paleta contemporánea sitúa la marca en el Madrid actual.",
        en: "From there we took that mix into the visual language. The wave pattern of Rio's pavements becomes a graphic device linking the identity to its founder's origin, while a contemporary palette places the brand in today's Madrid.",
      }),
      { type: "image", ratio: "landscape" },
      { type: "image", ratio: "square" },
      { type: "image", ratio: "portrait" },
    ],
  },
  stub("branding", "maruch", "Maruch", "2025", "02", { ratio: "square" }),
  stub("branding", "unrated", "UNRATED", "2026", "03", { ratio: "portrait" }),
  stub("branding", "joia-by-buccara", "Joia by Buccara", "2026", "04", { ratio: "landscape" }),
  stub("branding", "awake", "Awake", "2026", "05", { ratio: "portrait" }),
  stub("branding", "mesonero-romanos", "Mesonero-Romanos Studio", "2025", "06", { ratio: "landscape" }),
  stub("branding", "espacio-trimmings", "Espacio Trimmings", "2026", "07", { ratio: "landscape" }),
  stub("branding", "carpadiem", "CarpaDiem", "2026", "08", { ratio: "portrait" }),
  stub("branding", "laberinto-studio", "Laberinto Studio", "2026", "09", { ratio: "portrait" }),
  stub("branding", "beatriz-ortiz-clinic", "Beatriz Ortiz Clinic", "2025", "10", { ratio: "square" }),
  stub("branding", "volver-a-casa", "Volver a Casa by Fundación Manantial", "2026", "11", { ratio: "landscape" }),
  stub("branding", "milton-education", "Milton Education", "2024", "12", { ratio: "landscape" }),
  stub("branding", "beston", "Beston", "2024", "13", { ratio: "portrait" }),
  stub("branding", "canica", "Canica", "2024", "14", { ratio: "square" }),
  stub("branding", "natuka-branding", "Natuka", "2024", "15", { ratio: "portrait" }),

  // ---- CAMPAÑAS DE PUBLICIDAD (6096:1162, 7 projects) -------------------
  {
    category: "campanas",
    slug: "natuka-camion-robado",
    title: "Camión Robado",
    client: "Natuka",
    year: "2025",
    index: "01",
    version: 2,
    area: { ratio: "landscape" },
    // v2 (Figma 6100:1281): 2 text columns + 1 big video + a 2-image row below.
    layout: {
      columns: [
        [
          { content: { es: "¿Cómo lanzas una nueva forma de hacer las cosas sin decir que la anterior estaba mal?", en: "How do you launch a new way of doing things without saying the old one was wrong?" } },
          { content: { es: "Natuka siempre había apostado por el BARF: alimentación cruda, natural y de calidad para perros y gatos. El reto era lanzar una nueva línea de comida cocinada sin enfrentarla a la anterior, porque no se trataba de sustituir una por otra, sino de ampliar las opciones.", en: "Natuka had always backed BARF: raw, natural, quality food for dogs and cats. The challenge was to launch a new cooked line without pitting it against the old one — it wasn't about replacing it, but widening the options." } },
          { content: { es: "Así que decidimos no hablar de comida.", en: "So we decided not to talk about food." } },
          { content: { es: "Hicimos que desapareciera un camión.", en: "We made a truck disappear." }, emphasis: true },
          { content: { es: "Lanzamos el rumor de que habían robado un camión de Natuka y pedimos a su comunidad que nos ayudara a encontrarlo. La historia empezó a crecer hasta involucrar a la propia comunidad, otras marcas e incluso a la competencia.", en: "We spread the rumour that a Natuka truck had been stolen and asked its community to help find it. The story grew until it pulled in the community, other brands and even the competition." } },
          { content: { es: "Después llegó un telediario. El camión había desaparecido. Y el misterio seguía creciendo. Hasta que apareció.", en: "Then it hit the news. The truck had vanished. And the mystery kept growing. Until it turned up." } },
        ],
        [
          { content: { es: "Lo tenía ese amigo al que le gusta la carne, muy, muy hecha.", en: "That friend of yours who likes his meat very, very well done had it." }, emphasis: true },
          { content: { es: "Ahí estaba el giro: el camión no había desaparecido. Nos estaba llevando hasta el lanzamiento de la nueva comida cocinada de Natuka.", en: "That was the twist: the truck hadn't vanished. It was driving us to the launch of Natuka's new cooked food." } },
          { content: { es: "A partir de ahí, construimos una campaña alrededor de una idea sencilla: no tienes que elegir entre lo crudo y lo cocinado.", en: "From there, we built a campaign around a simple idea: you don't have to choose between raw and cooked." } },
          { content: { es: "Igual de buenos, igual de naturales. Simplemente, diferentes.", en: "Just as good, just as natural. Simply different." }, emphasis: true },
          { content: { es: "La trasladamos a diferentes situaciones de la vida cotidiana: sushi o pescado al horno, jamón serrano o bacon. Porque, al final, hay decisiones que dependen de cómo te guste disfrutar las cosas.", en: "We carried it into everyday situations: sushi or baked fish, serrano ham or bacon. Because, in the end, some choices just come down to how you like to enjoy things." } },
          { content: { es: "Una campaña que convirtió un lanzamiento de producto en una historia que la comunidad quiso seguir, compartir y descubrir.", en: "A campaign that turned a product launch into a story the community wanted to follow, share and discover." } },
        ],
      ],
      media: { type: "video" },
      secondaryMedia: [
        { type: "image", ratio: "landscape" },
        { type: "image", ratio: "portrait" },
      ],
    },
    blocks: [
      lead({
        es: "¿Cómo lanzas una nueva forma de hacer las cosas sin decir que la anterior estaba mal?",
        en: "How do you launch a new way of doing things without saying the old one was wrong?",
      }),
      { type: "video" },
      { type: "image", ratio: "landscape" },
      { type: "image", ratio: "portrait" },
    ],
  },
  {
    category: "campanas",
    slug: "vb-group-pasion-por-viajar",
    title: "Pasión por viajar",
    client: "VB Group",
    year: "2025",
    index: "02",
    version: 3,
    area: { ratio: "landscape" },
    // v3 (Figma 6109:25): 1 text column + 1 big video, no secondary row.
    layout: {
      columns: [
        [
          { content: { es: "VB Group necesitaba una campaña audiovisual para sus espacios en los estadios del RCD Espanyol, FC Girona y RC Celta de Vigo. Tres equipos, tres piezas y muy poco tiempo para hacerlo realidad.", en: "VB Group needed an audiovisual campaign for its spaces at the RCD Espanyol, FC Girona and RC Celta de Vigo stadiums. Three teams, three pieces and very little time to make it real." } },
          { content: { es: "El reto: conectar dos mundos aparentemente distintos: viajar y fútbol.", en: "The challenge: connecting two seemingly different worlds — travel and football." } },
          { content: { es: "La clave estaba en encontrar un punto de encuentro: el fútbol también es un viaje de emociones. A partir de ahí, jugamos con las paradojas, rituales e insights que comparten ambos mundos: viajar es descubrir monumentos históricos —como el estadio—; probar comida experimental —las míticas pipas mientras vemos el partido—; encontrar tu bar de confianza —no sabemos si tan de confianza, pero hablamos del VAR—; una visita a los dioses —esos jugadores que han dejado huella y que siempre están presentes—; entre otras comparativas.", en: "The key was finding common ground: football is also an emotional journey. From there, we played with the paradoxes, rituals and insights both worlds share: travelling means discovering historic monuments —like the stadium—; trying experimental food —the legendary sunflower seeds during the match—; finding your trusted bar —we're not sure how trustworthy, but let's talk about VAR—; a visit to the gods —those players who left their mark and are always present—; among other comparisons." } },
          { content: { es: "Un juego de dobles sentidos que nos permitió construir un concepto adaptable a cada equipo y a su propia identidad: VB Group. Viajar más allá del estadio.", en: "A play on double meanings that let us build a concept adaptable to each team and its own identity: VB Group. Travel beyond the stadium." } },
        ],
      ],
      media: { type: "video" },
    },
    blocks: [
      lead({
        es: "VB Group necesitaba una campaña audiovisual para sus espacios en los estadios del RCD Espanyol, FC Girona y RC Celta de Vigo: tres equipos, tres piezas y muy poco tiempo para hacerlo realidad. El reto: conectar dos mundos aparentemente distintos, viajar y fútbol.",
        en: "VB Group needed an audiovisual campaign for its spaces at the RCD Espanyol, FC Girona and RC Celta de Vigo stadiums: three teams, three pieces and very little time. The challenge: connecting two seemingly different worlds — travel and football.",
      }),
      { type: "video" },
    ],
  },
  stub("campanas", "fosters-hollywood-la-salsa", "La Salsa", "2024", "03", { ratio: "landscape" }),
  stub("campanas", "natuka-latas", "Latas", "2026", "04", { ratio: "landscape" }),
  stub("campanas", "baudesson-lanzamientos", "Lanzamientos", "2026", "05", { ratio: "landscape" }),
  stub("campanas", "mim-shoes-universal-sneakers", "Universal Sneakers", "2025", "06", { ratio: "landscape" }),
  stub("campanas", "materh-seguros", "Seguros", "2025", "07", { ratio: "portrait" }),
];

// Client names for the two "stub" campañas cases share their brand's real
// client, not the case title (title = campaign name, client = brand name).
const overrideClient = (slug: string, client: string) => {
  const c = CASES.find((c) => c.slug === slug);
  if (c) c.client = client;
};
overrideClient("fosters-hollywood-la-salsa", "Foster's Hollywood");
overrideClient("natuka-latas", "Natuka");
overrideClient("baudesson-lanzamientos", "Baudesson");
overrideClient("mim-shoes-universal-sneakers", "MIM Shoes");
overrideClient("materh-seguros", "MatErh");

export const casesByCategory = (slug: string) =>
  CASES.filter((c) => c.category === slug);

export const getCase = (category: string, slug: string) =>
  CASES.find((c) => c.category === category && c.slug === slug);

/**
 * Link target for a client name shown in the Work-index hover list. Only
 * clients that already have a published case study resolve to a URL; the
 * rest render as plain (non-clickable) text until their case is added.
 */
export const getCaseHref = (category: string, client: string): string | null => {
  const found = CASES.find(
    (c) =>
      c.category === category &&
      c.client.trim().toLowerCase() === client.trim().toLowerCase(),
  );
  return found ? `/work/${category}/${found.slug}` : null;
};

/** Image/video blocks of a case, capped at 6 (for the lightbox + counters).
 * v2/v3 cases carry their media in `layout` instead of `blocks`. */
export const caseMedia = (c: CaseStudy): MediaBlock[] =>
  c.layout
    ? [c.layout.media, ...(c.layout.secondaryMedia ?? [])].slice(0, 6)
    : c.blocks
        .filter((b): b is MediaBlock => b.type === "image" || b.type === "video")
        .slice(0, 6);

/** "2026" -> "[20 26]" as shown in the Figma case header. */
export const yearTag = (year: string) =>
  year.length === 4 ? `[${year.slice(0, 2)} ${year.slice(2)}]` : `[${year}]`;
