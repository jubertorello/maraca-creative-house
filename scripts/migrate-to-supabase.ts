/**
 * One-off: copies the current content from src/data/*.json into Supabase.
 * Run once, right after creating the tables with supabase/schema.sql and
 * setting the Supabase env vars in .env.local:
 *
 *   npx tsx scripts/migrate-to-supabase.ts
 *
 * Safe to re-run — it upserts, so running it again just overwrites rows
 * with the same slug rather than duplicating them.
 */
import { createClient } from "@supabase/supabase-js";
import categoriesData from "../src/data/categories.json";
import casesData from "../src/data/cases.json";
import siteContentData from "../src/data/site-content.json";
import clientsData from "../src/data/clients.json";
import teamData from "../src/data/team.json";
import type { Category, CaseStudy } from "../src/lib/work";
import type { Client } from "../src/lib/clients";
import type { Member } from "../src/lib/team";
import type { HomeContent, AboutContent, TeamContent } from "../src/lib/site-content";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const categories = categoriesData as Category[];
  const cases = casesData as CaseStudy[];

  const categoryRows = categories.map((c) => ({
    slug: c.slug,
    index: c.index,
    name_es: c.name.es,
    name_en: c.name.en,
    enabled: c.enabled,
    kind: c.kind ?? null,
    clients: c.clients,
    image: c.image ?? null,
  }));

  const { error: catError } = await supabase.from("categories").upsert(categoryRows);
  if (catError) throw catError;
  console.log(`✓ ${categoryRows.length} categorías`);

  const caseRows = cases.map((c) => ({
    category: c.category,
    slug: c.slug,
    title: c.title,
    client: c.client,
    year: c.year,
    index: c.index,
    version: c.version,
    blocks: c.blocks,
    layout: c.layout ?? null,
    area: c.area ?? null,
  }));

  const { error: caseError } = await supabase
    .from("cases")
    .upsert(caseRows, { onConflict: "category,slug" });
  if (caseError) throw caseError;
  console.log(`✓ ${caseRows.length} casos`);

  const siteContent = siteContentData as {
    home: HomeContent;
    about: AboutContent;
    team: TeamContent;
  };
  const { error: contentError } = await supabase
    .from("site_content")
    .upsert([
      { id: "home", data: siteContent.home },
      { id: "about", data: siteContent.about },
      { id: "team", data: siteContent.team },
    ]);
  if (contentError) throw contentError;
  console.log("✓ contenido de Home, About y Team");

  const clients = clientsData as Client[];
  const clientRows = clients.map((c, i) => ({
    slug: c.slug,
    name: c.name,
    logo_url: c.logoUrl ?? null,
    sort_order: i,
  }));
  const { error: clientsError } = await supabase.from("clients").upsert(clientRows);
  if (clientsError) throw clientsError;
  console.log(`✓ ${clientRows.length} marcas`);

  const team = teamData as Member[];
  const teamRows = team.map((m, i) => ({
    slug: m.slug,
    name: m.name,
    role_es: m.role.es,
    role_en: m.role.en,
    photo_url: m.photoUrl ?? null,
    sort_order: i,
  }));
  const { error: teamError } = await supabase.from("team_members").upsert(teamRows);
  if (teamError) throw teamError;
  console.log(`✓ ${teamRows.length} personas del equipo`);
}

main().then(
  () => {
    console.log("Migración completa.");
    process.exit(0);
  },
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
