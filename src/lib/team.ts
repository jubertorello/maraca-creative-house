/**
 * Team — Figma "Equipo" > Participadas (6049:575). B&W portraits at
 * /public/media/team/<slug>.jpg; `photo: true` on the ones that have a file.
 */
export type Member = {
  slug: string;
  name: string;
  role: { es: string; en: string };
  photo?: boolean;
};

export const TEAM: Member[] = [
  {
    slug: "macarena-erhardt",
    name: "Macarena Erhardt",
    role: { es: "Strategy Director", en: "Strategy Director" },
    photo: true,
  },
  {
    slug: "jimena-moreno",
    name: "Jimena Moreno",
    role: { es: "Operations Director", en: "Operations Director" },
    photo: true,
  },
  {
    slug: "lilian-tolleson",
    name: "Lilian Tolleson",
    role: { es: "Creative Director", en: "Creative Director" },
    photo: true,
  },
  {
    slug: "bia-ribeiro",
    name: "Bia Ribeiro",
    role: {
      es: "Creative & Social Media Content Creator",
      en: "Creative & Social Media Content Creator",
    },
    photo: true,
  },
  {
    slug: "lorena-fusulier",
    name: "Lorena Fusulier",
    role: {
      es: "Social Media & Graphic Designer",
      en: "Social Media & Graphic Designer",
    },
    photo: true,
  },
  {
    slug: "carla-escobar",
    name: "Carla Escobar",
    role: {
      es: "Social Media & Content Creator",
      en: "Social Media & Content Creator",
    },
    photo: true,
  },
  {
    slug: "ines-lopez-de-garayo",
    name: "Inés López de Garayo",
    role: {
      es: "Communications & PR Strategist",
      en: "Communications & PR Strategist",
    },
    photo: true,
  },
];
