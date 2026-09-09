/**
 * Backoffice data access — the ONE place that reads/writes categories and
 * cases. Every /admin API route goes through here, and so does anything
 * on the public site that needs live data (see src/lib/work.ts).
 *
 * Two backends, chosen automatically via SUPABASE_ENABLED (src/lib/supabase.ts):
 *  - Supabase (once connected): the real, persistent store — works from
 *    Vercel production too, since it's a network call, not a filesystem
 *    write.
 *  - Local JSON files (src/data/*.json): the fallback used before Supabase
 *    is connected. Only writable from `npm run dev` — Vercel's filesystem
 *    is read-only in production, so edits made there won't stick until
 *    Supabase is wired in.
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { Category, CaseStudy } from "@/lib/work";
import type { Client } from "@/lib/clients";
import type { Member } from "@/lib/team";
import type {
  HomeContent,
  AboutContent,
  TeamContent,
  SeoContent,
  PrivacyPolicyContent,
  ContactContent,
  FooterContent,
} from "@/lib/site-content";
import { SUPABASE_ENABLED, supabaseAdmin } from "@/lib/supabase";
import { deleteCloudinaryAssetByUrl } from "@/lib/cloudinary";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const CATEGORIES_PATH = path.join(DATA_DIR, "categories.json");
const CASES_PATH = path.join(DATA_DIR, "cases.json");
const SITE_CONTENT_PATH = path.join(DATA_DIR, "site-content.json");
const CLIENTS_PATH = path.join(DATA_DIR, "clients.json");
const TEAM_PATH = path.join(DATA_DIR, "team.json");

/* ------------------------------------------------------ row <-> shape --- */

type CategoryRow = {
  slug: string;
  index: string;
  name_es: string;
  name_en: string;
  enabled: boolean;
  kind: string | null;
  clients: string[];
  image: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

type CaseRow = {
  category: string;
  slug: string;
  title: string;
  client: string;
  year: string;
  index: string;
  version: number;
  blocks: CaseStudy["blocks"];
  layout: CaseStudy["layout"] | null;
  area: CaseStudy["area"] | null;
  seo_title: string | null;
  seo_description: string | null;
};

const categoryFromRow = (r: CategoryRow): Category => ({
  slug: r.slug as Category["slug"],
  index: r.index,
  name: { es: r.name_es, en: r.name_en },
  enabled: r.enabled,
  kind: (r.kind ?? undefined) as Category["kind"],
  clients: r.clients,
  image: r.image ?? undefined,
  seoTitle: r.seo_title ?? undefined,
  seoDescription: r.seo_description ?? undefined,
});

const categoryToRow = (c: Category): CategoryRow => ({
  slug: c.slug,
  index: c.index,
  name_es: c.name.es,
  name_en: c.name.en,
  enabled: c.enabled,
  kind: c.kind ?? null,
  clients: c.clients,
  image: c.image ?? null,
  seo_title: c.seoTitle ?? null,
  seo_description: c.seoDescription ?? null,
});

const caseFromRow = (r: CaseRow): CaseStudy => ({
  category: r.category as CaseStudy["category"],
  slug: r.slug,
  title: r.title,
  client: r.client,
  year: r.year,
  index: r.index,
  version: r.version as CaseStudy["version"],
  blocks: r.blocks,
  layout: r.layout ?? undefined,
  area: r.area ?? undefined,
  seoTitle: r.seo_title ?? undefined,
  seoDescription: r.seo_description ?? undefined,
});

const caseToRow = (c: CaseStudy): CaseRow => ({
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
  seo_title: c.seoTitle ?? null,
  seo_description: c.seoDescription ?? null,
});

/* ------------------------------------------------------------ fs mode --- */

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/* ------------------------------------------------------- categories --- */

export async function readCategories(): Promise<Category[]> {
  if (SUPABASE_ENABLED) {
    const { data, error } = await supabaseAdmin()
      .from("categories")
      .select("*")
      .order("index");
    if (error) throw error;
    return (data as CategoryRow[]).map(categoryFromRow);
  }
  return readJson<Category[]>(CATEGORIES_PATH);
}

async function writeCategories(categories: Category[]): Promise<void> {
  await writeJson(CATEGORIES_PATH, categories);
}

export async function updateCategory(
  slug: string,
  patch: Partial<Category>,
): Promise<Category | null> {
  if (SUPABASE_ENABLED) {
    const current = await readCategories();
    const existing = current.find((c) => c.slug === slug);
    if (!existing) return null;
    const merged = { ...existing, ...patch };
    const { data, error } = await supabaseAdmin()
      .from("categories")
      .update(categoryToRow(merged))
      .eq("slug", slug)
      .select()
      .single();
    if (error) throw error;
    return categoryFromRow(data as CategoryRow);
  }

  const categories = await readCategories();
  const idx = categories.findIndex((c) => c.slug === slug);
  if (idx === -1) return null;
  categories[idx] = { ...categories[idx], ...patch };
  await writeCategories(categories);
  return categories[idx];
}

/* ------------------------------------------------------------- cases --- */

export async function readCases(): Promise<CaseStudy[]> {
  if (SUPABASE_ENABLED) {
    const { data, error } = await supabaseAdmin()
      .from("cases")
      .select("*")
      .order("category")
      .order("index");
    if (error) throw error;
    return (data as CaseRow[]).map(caseFromRow);
  }
  return readJson<CaseStudy[]>(CASES_PATH);
}

async function writeCases(cases: CaseStudy[]): Promise<void> {
  await writeJson(CASES_PATH, cases);
}

/**
 * For a "listing"-kind category (branding, etc.) the client list shown on
 * hover from the Work index isn't maintained separately from the cases —
 * it IS the cases' client names, in the same order, kept in sync here so a
 * brand only ever gets typed once (as a case), never twice. "manifesto"/
 * "pending" categories have no case pages, so their client list stays a
 * manually-edited plain list (see updateCategory).
 */
async function syncCategoryClientsFromCases(category: string): Promise<void> {
  const [categories, cases] = await Promise.all([readCategories(), readCases()]);
  const cat = categories.find((c) => c.slug === category);
  if (!cat || (cat.kind && cat.kind !== "listing")) return;

  const clients = cases
    .filter((c) => c.category === category)
    .sort((a, b) => a.index.localeCompare(b.index))
    .map((c) => c.client);

  if (JSON.stringify(clients) === JSON.stringify(cat.clients)) return;
  await updateCategory(category, { clients });
}

export async function upsertCase(newCase: CaseStudy): Promise<void> {
  if (SUPABASE_ENABLED) {
    const { error } = await supabaseAdmin()
      .from("cases")
      .upsert(caseToRow(newCase), { onConflict: "category,slug" });
    if (error) throw error;
  } else {
    const cases = await readCases();
    const idx = cases.findIndex(
      (c) => c.category === newCase.category && c.slug === newCase.slug,
    );
    if (idx === -1) cases.push(newCase);
    else cases[idx] = newCase;
    await writeCases(cases);
  }
  await syncCategoryClientsFromCases(newCase.category);
}

/** Every image/video URL a case references — used to cascade-delete the
 * Cloudinary assets when the case itself is deleted. */
function caseMediaUrls(c: CaseStudy): (string | undefined)[] {
  const fromBlocks = c.blocks
    .filter((b) => b.type === "image" || b.type === "video")
    .map((b) => (b as { src?: string }).src);
  const fromLayout = c.layout
    ? [c.layout.media.src, ...(c.layout.secondaryMedia ?? []).map((m) => m.src)]
    : [];
  return [...fromBlocks, ...fromLayout];
}

export async function deleteCase(category: string, slug: string): Promise<void> {
  const existing = (await readCases()).find(
    (c) => c.category === category && c.slug === slug,
  );
  if (existing) {
    await Promise.all(caseMediaUrls(existing).map(deleteCloudinaryAssetByUrl));
  }

  if (SUPABASE_ENABLED) {
    const { error } = await supabaseAdmin()
      .from("cases")
      .delete()
      .eq("category", category)
      .eq("slug", slug);
    if (error) throw error;
  } else {
    const cases = await readCases();
    await writeCases(cases.filter((c) => !(c.category === category && c.slug === slug)));
  }

  // Close the gap the deleted case left in `index` (01, 02, 03, ...) —
  // otherwise a case created afterwards, whose index is just "current
  // count + 1" (see admin/work/[category]/new/page.tsx), can collide with
  // an existing one instead of landing on the next free number. Reuses
  // reorderCases, which already does this renumbering and also calls
  // syncCategoryClientsFromCases.
  const remaining = (await readCases())
    .filter((c) => c.category === category)
    .sort((a, b) => a.index.localeCompare(b.index));
  await reorderCases(
    category,
    remaining.map((c) => c.slug),
  );
}

export async function reorderCases(category: string, orderedSlugs: string[]): Promise<void> {
  const cases = await readCases();
  const inCategory = cases.filter((c) => c.category === category);
  const bySlug = new Map(inCategory.map((c) => [c.slug, c]));
  const reordered = orderedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((c): c is CaseStudy => Boolean(c))
    .map((c, i) => ({ ...c, index: String(i + 1).padStart(2, "0") }));

  if (SUPABASE_ENABLED) {
    const { error } = await supabaseAdmin()
      .from("cases")
      .upsert(reordered.map(caseToRow), { onConflict: "category,slug" });
    if (error) throw error;
  } else {
    const others = cases.filter((c) => c.category !== category);
    await writeCases([...others, ...reordered]);
  }
  await syncCategoryClientsFromCases(category);
}

/* ------------------------------------------------------ site content --- */

type SiteContentData = {
  home: HomeContent;
  about: AboutContent;
  team: TeamContent;
  seo: SeoContent;
  privacyPolicy: PrivacyPolicyContent;
  contact: ContactContent;
  footer: FooterContent;
};

async function readSiteContentJson(): Promise<SiteContentData> {
  return readJson<SiteContentData>(SITE_CONTENT_PATH);
}

export async function readSiteContent<K extends keyof SiteContentData>(
  id: K,
): Promise<SiteContentData[K]> {
  if (SUPABASE_ENABLED) {
    const { data, error } = await supabaseAdmin()
      .from("site_content")
      .select("data")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (data?.data) return data.data as SiteContentData[K];
    // Not in Supabase yet — fall back to the JSON snapshot so the form
    // isn't empty the first time (saving will create the row).
    return (await readSiteContentJson())[id];
  }
  return (await readSiteContentJson())[id];
}

export async function writeSiteContent<K extends keyof SiteContentData>(
  id: K,
  data: SiteContentData[K],
): Promise<void> {
  if (SUPABASE_ENABLED) {
    const { error } = await supabaseAdmin().from("site_content").upsert({ id, data });
    if (error) throw error;
    return;
  }
  const all = await readSiteContentJson();
  all[id] = data;
  await writeJson(SITE_CONTENT_PATH, all);
}

/* ------------------------------------------------------------ clients --- */

type ClientRow = { slug: string; name: string; logo_url: string | null; sort_order: number };

const clientFromRow = (r: ClientRow): Client => ({
  name: r.name,
  slug: r.slug,
  logoUrl: r.logo_url ?? undefined,
});

const clientToRow = (c: Client, sortOrder: number): ClientRow => ({
  slug: c.slug,
  name: c.name,
  logo_url: c.logoUrl ?? null,
  sort_order: sortOrder,
});

export async function readClients(): Promise<Client[]> {
  if (SUPABASE_ENABLED) {
    const { data, error } = await supabaseAdmin().from("clients").select("*").order("sort_order");
    if (error) throw error;
    return (data as ClientRow[]).map(clientFromRow);
  }
  return readJson<Client[]>(CLIENTS_PATH);
}

async function writeClients(clients: Client[]): Promise<void> {
  await writeJson(CLIENTS_PATH, clients);
}

export async function upsertClient(client: Client): Promise<void> {
  if (SUPABASE_ENABLED) {
    const current = await readClients();
    const idx = current.findIndex((c) => c.slug === client.slug);
    const sortOrder = idx === -1 ? current.length : idx;
    const { error } = await supabaseAdmin()
      .from("clients")
      .upsert(clientToRow(client, sortOrder));
    if (error) throw error;
    return;
  }
  const clients = await readClients();
  const idx = clients.findIndex((c) => c.slug === client.slug);
  if (idx === -1) clients.push(client);
  else clients[idx] = client;
  await writeClients(clients);
}

export async function deleteClient(slug: string): Promise<void> {
  const existing = (await readClients()).find((c) => c.slug === slug);
  if (existing) await deleteCloudinaryAssetByUrl(existing.logoUrl);

  if (SUPABASE_ENABLED) {
    const { error } = await supabaseAdmin().from("clients").delete().eq("slug", slug);
    if (error) throw error;
    // Close the gap the deleted row left in sort_order — otherwise a
    // client added afterwards (sort_order = current count) can land on a
    // number an existing row already has (see upsertClient above).
    await reorderClients((await readClients()).map((c) => c.slug));
    return;
  }
  const clients = await readClients();
  await writeClients(clients.filter((c) => c.slug !== slug));
}

export async function reorderClients(orderedSlugs: string[]): Promise<void> {
  const clients = await readClients();
  const bySlug = new Map(clients.map((c) => [c.slug, c]));
  const reordered = orderedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((c): c is Client => Boolean(c));

  if (SUPABASE_ENABLED) {
    const { error } = await supabaseAdmin()
      .from("clients")
      .upsert(reordered.map((c, i) => clientToRow(c, i)));
    if (error) throw error;
    return;
  }
  await writeClients(reordered);
}

/* --------------------------------------------------------------- team --- */

type MemberRow = {
  slug: string;
  name: string;
  role_es: string;
  role_en: string;
  photo_url: string | null;
  sort_order: number;
};

const memberFromRow = (r: MemberRow): Member => ({
  slug: r.slug,
  name: r.name,
  role: { es: r.role_es, en: r.role_en },
  photoUrl: r.photo_url ?? undefined,
});

const memberToRow = (m: Member, sortOrder: number): MemberRow => ({
  slug: m.slug,
  name: m.name,
  role_es: m.role.es,
  role_en: m.role.en,
  photo_url: m.photoUrl ?? null,
  sort_order: sortOrder,
});

export async function readTeam(): Promise<Member[]> {
  if (SUPABASE_ENABLED) {
    const { data, error } = await supabaseAdmin()
      .from("team_members")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return (data as MemberRow[]).map(memberFromRow);
  }
  return readJson<Member[]>(TEAM_PATH);
}

async function writeTeam(team: Member[]): Promise<void> {
  await writeJson(TEAM_PATH, team);
}

export async function upsertMember(member: Member): Promise<void> {
  if (SUPABASE_ENABLED) {
    const current = await readTeam();
    const idx = current.findIndex((m) => m.slug === member.slug);
    const sortOrder = idx === -1 ? current.length : idx;
    const { error } = await supabaseAdmin()
      .from("team_members")
      .upsert(memberToRow(member, sortOrder));
    if (error) throw error;
    return;
  }
  const team = await readTeam();
  const idx = team.findIndex((m) => m.slug === member.slug);
  if (idx === -1) team.push(member);
  else team[idx] = member;
  await writeTeam(team);
}

export async function deleteMember(slug: string): Promise<void> {
  const existing = (await readTeam()).find((m) => m.slug === slug);
  if (existing) await deleteCloudinaryAssetByUrl(existing.photoUrl);

  if (SUPABASE_ENABLED) {
    const { error } = await supabaseAdmin().from("team_members").delete().eq("slug", slug);
    if (error) throw error;
    // Close the gap the deleted row left in sort_order — same reasoning as
    // deleteClient above.
    await reorderTeam((await readTeam()).map((m) => m.slug));
    return;
  }
  const team = await readTeam();
  await writeTeam(team.filter((m) => m.slug !== slug));
}

export async function reorderTeam(orderedSlugs: string[]): Promise<void> {
  const team = await readTeam();
  const bySlug = new Map(team.map((m) => [m.slug, m]));
  const reordered = orderedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((m): m is Member => Boolean(m));

  if (SUPABASE_ENABLED) {
    const { error } = await supabaseAdmin()
      .from("team_members")
      .upsert(reordered.map((m, i) => memberToRow(m, i)));
    if (error) throw error;
    return;
  }
  await writeTeam(reordered);
}
