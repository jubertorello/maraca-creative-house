/**
 * Scans every place a Cloudinary URL can be referenced from the CMS data
 * (site content, categories, clients, team, cases) and builds a map from
 * that exact URL to every place it's used — powers /admin/media, which
 * needs to know, for each uploaded file, whether it's safe to delete and
 * where to point the editor if it isn't.
 *
 * Relies on every admin write path storing the *raw* Cloudinary URL with no
 * transformation prefix (verified true across CategoryManager, CaseForm,
 * ClientsManager, MembersManager, the content managers — `cldOptimize()` is
 * only ever applied at render time) — so a straight string match against
 * Cloudinary's own `secure_url` is reliable, no normalization needed.
 */

import {
  readCategories,
  readCases,
  readClients,
  readTeam,
  readSiteContent,
} from "@/lib/admin-data";
import type { MediaBlock } from "@/lib/work";

export type MediaUsage = { label: string; href: string };

async function buildUsageMap(): Promise<Map<string, MediaUsage[]>> {
  const map = new Map<string, MediaUsage[]>();

  function add(url: string | undefined | null, label: string, href: string) {
    if (!url) return;
    const list = map.get(url) ?? [];
    list.push({ label, href });
    map.set(url, list);
  }

  function addMedia(m: MediaBlock | undefined, label: string, href: string) {
    if (!m) return;
    add(m.src, label, href);
    if (m.type === "video") add(m.poster, `${label} (poster)`, href);
  }

  const [categories, cases, clients, team, home, about, teamContent, seo] =
    await Promise.all([
      readCategories(),
      readCases(),
      readClients(),
      readTeam(),
      readSiteContent("home"),
      readSiteContent("about"),
      readSiteContent("team"),
      readSiteContent("seo"),
    ]);

  add(home.heroVideo.desktop, "Home — Video principal (desktop)", "/admin/home");
  add(home.heroVideo.mobile, "Home — Video principal (mobile)", "/admin/home");
  add(home.recentWorkVideo.desktop, "Home — Video de abajo (desktop)", "/admin/home");
  add(home.recentWorkVideo.mobile, "Home — Video de abajo (mobile)", "/admin/home");

  add(about.heroVideo.desktop, "About us — Video del hero (desktop)", "/admin/about");
  add(about.heroVideo.mobile, "About us — Video del hero (mobile)", "/admin/about");

  add(teamContent.heroVideo.desktop, "Team — Video del hero (desktop)", "/admin/team");
  add(teamContent.heroVideo.mobile, "Team — Video del hero (mobile)", "/admin/team");

  add(seo.global.ogImageUrl, "SEO — Imagen para compartir (OG)", "/admin/seo");

  for (const cat of categories) {
    add(cat.image, `Work — Miniatura de "${cat.name.es}"`, `/admin/work/${cat.slug}`);
  }

  for (const client of clients) {
    add(client.logoUrl, `Marca: ${client.name}`, "/admin/about");
  }

  for (const member of team) {
    add(member.photoUrl, `Equipo: ${member.name}`, "/admin/team");
  }

  for (const c of cases) {
    const href = `/admin/work/${c.category}/${c.slug}`;
    const label = `Caso: ${c.client} (${c.category})`;

    add(c.area?.image, `${label} — miniatura de listado`, href);

    if (c.layout) {
      addMedia(c.layout.media, `${label} — imagen principal`, href);
      c.layout.secondaryMedia?.forEach((m, i) =>
        addMedia(m, `${label} — imagen secundaria ${i + 1}`, href),
      );
    } else {
      let imgIndex = 0;
      for (const block of c.blocks) {
        if (block.type !== "image" && block.type !== "video") continue;
        imgIndex += 1;
        addMedia(block, `${label} — posición ${imgIndex}`, href);
      }
    }
  }

  return map;
}

export async function getMediaUsage(url: string): Promise<MediaUsage[]> {
  const map = await buildUsageMap();
  return map.get(url) ?? [];
}

export async function getAllMediaUsage(): Promise<Map<string, MediaUsage[]>> {
  return buildUsageMap();
}
