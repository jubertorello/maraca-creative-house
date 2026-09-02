/**
 * Clients / brands. Figma "About us" logos section (6081:450) + landing
 * carousel (6183:1245). This list will come from the content admin later;
 * for now `logo: true` marks the ones with a real file in
 * /public/brand/clients/<slug>.png.
 */
export type Client = { name: string; slug: string; logo?: boolean };

export const CLIENTS: Client[] = [
  { name: "CaixaBank", slug: "caixabank", logo: true },
  { name: "BBC", slug: "bbc", logo: true },
  { name: "Foster's Hollywood", slug: "fosters-hollywood", logo: true },
  { name: "Bluey", slug: "bluey", logo: true },
  { name: "BUCCARA", slug: "buccara", logo: true },
  { name: "Corpfin Capital", slug: "corpfin-capital", logo: true },
  { name: "VB Group", slug: "vb-group", logo: true },
  { name: "Beston", slug: "beston", logo: true },
  { name: "baïa", slug: "baia", logo: true },
  { name: "Natuka", slug: "natuka", logo: true },
  { name: "Casabarré", slug: "casabarre" },
  { name: "Milton Education", slug: "milton-education" },
  { name: "Mira Miranda", slug: "mira-miranda" },
  { name: "MatErh.", slug: "materh" },
  { name: "Canica", slug: "canica" },
  { name: "OMA by Luchi", slug: "oma-by-luchi" },
  { name: "KISH&Go", slug: "kish-and-go" },
  { name: "Fundación Manantial", slug: "fundacion-manantial" },
  { name: "Mesonero Romanos", slug: "mesonero-romanos" },
  { name: "Beatriz Ortiz", slug: "beatriz-ortiz" },
  { name: "Volver a Casa", slug: "volver-a-casa" },
  { name: "UNRATED", slug: "unrated" },
  { name: "BAUDESSON", slug: "baudesson" },
  { name: "AWAKE", slug: "awake" },
  { name: "Continuo", slug: "continuo" },
  { name: "Espacio Trimmings", slug: "espacio-trimmings" },
  { name: "Maruch", slug: "maruch" },
  { name: "CarpaDiem", slug: "carpadiem" },
  { name: "Laberinto", slug: "laberinto" },
  { name: "MiM", slug: "mim" },
];

/** Only the clients that have a real logo asset (dynamic — grows via the CMS). */
export const CLIENTS_WITH_LOGO = CLIENTS.filter((c) => c.logo);
