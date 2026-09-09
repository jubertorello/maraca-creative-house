/**
 * One-off: uploads every local media file still referenced from
 * src/data/*.json (category tile images, team photos, client logos, page
 * videos) to Cloudinary, then rewrites those JSON files — and, if Supabase
 * is connected, the live tables too — to point at the resulting Cloudinary
 * URLs instead of /public files.
 *
 *   npx tsx --env-file=.env.local scripts/upload-media-to-cloudinary.ts
 *
 * Safe to re-run: uses each file's own path as a stable Cloudinary
 * public_id, so re-running just re-uploads (overwrite) instead of
 * duplicating.
 */
import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "src", "data");

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("Faltan las variables CLOUDINARY_* en .env.local.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const SUPABASE_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const supabase = SUPABASE_ENABLED
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )
  : null;

/** Cache so the same local file (e.g. reused across records) only uploads once. */
const cache = new Map<string, string>();

async function uploadLocal(publicPath: string, resourceType: "image" | "video"): Promise<string> {
  if (cache.has(publicPath)) return cache.get(publicPath)!;

  const localFile = path.join(PUBLIC_DIR, publicPath.replace(/^\//, ""));
  if (!fs.existsSync(localFile)) {
    console.warn(`  ! no existe localmente, se deja como está: ${publicPath}`);
    cache.set(publicPath, publicPath);
    return publicPath;
  }

  const publicId = "maraca" + publicPath.replace(/\.[^.]+$/, "");
  const result = await cloudinary.uploader.upload(localFile, {
    public_id: publicId,
    resource_type: resourceType,
    overwrite: true,
  });
  console.log(`  ✓ ${publicPath} -> ${result.secure_url}`);
  cache.set(publicPath, result.secure_url);
  return result.secure_url;
}

const isLocal = (url: string | undefined | null) => Boolean(url && url.startsWith("/"));

async function main() {
  // ---- categories.json (tile images) ----
  const categoriesPath = path.join(DATA_DIR, "categories.json");
  const categories = JSON.parse(fs.readFileSync(categoriesPath, "utf-8"));
  console.log("Categorías (imágenes de miniatura):");
  for (const c of categories) {
    const src = c.image ?? `/media/services/${c.slug}.jpg`;
    if (isLocal(src)) c.image = await uploadLocal(src, "image");
  }
  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2) + "\n");

  // ---- team.json (photos) ----
  const teamPath = path.join(DATA_DIR, "team.json");
  const team = JSON.parse(fs.readFileSync(teamPath, "utf-8"));
  console.log("Equipo (fotos):");
  for (const m of team) {
    if (isLocal(m.photoUrl)) m.photoUrl = await uploadLocal(m.photoUrl, "image");
  }
  fs.writeFileSync(teamPath, JSON.stringify(team, null, 2) + "\n");

  // ---- clients.json (logos) ----
  const clientsPath = path.join(DATA_DIR, "clients.json");
  const clients = JSON.parse(fs.readFileSync(clientsPath, "utf-8"));
  console.log("Marcas (logos):");
  for (const c of clients) {
    if (isLocal(c.logoUrl)) c.logoUrl = await uploadLocal(c.logoUrl, "image");
  }
  fs.writeFileSync(clientsPath, JSON.stringify(clients, null, 2) + "\n");

  // ---- site-content.json (videos) ----
  const contentPath = path.join(DATA_DIR, "site-content.json");
  const content = JSON.parse(fs.readFileSync(contentPath, "utf-8"));
  console.log("Videos de página:");
  for (const page of Object.values(content) as Record<string, unknown>[]) {
    for (const key of Object.keys(page)) {
      const video = page[key] as { desktop?: string; mobile?: string } | undefined;
      if (video && typeof video === "object" && "desktop" in video) {
        if (isLocal(video.desktop)) video.desktop = await uploadLocal(video.desktop!, "video");
        if (isLocal(video.mobile)) video.mobile = await uploadLocal(video.mobile!, "video");
      }
    }
  }
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2) + "\n");

  // ---- estrategia.mp4 (StrategyView.tsx — not wired to /admin yet, but
  // still local content worth moving off /public like everything else) ----
  const estrategiaUrl = await uploadLocal("/media/estrategia.mp4", "video");
  console.log(`Estrategia video -> ${estrategiaUrl} (actualizá StrategyView.tsx a mano si hace falta)`);

  console.log("\nJSON local actualizado.");

  if (!supabase) {
    console.log("Supabase no está conectado — listo, solo se actualizó el JSON local.");
    return;
  }

  console.log("Sincronizando con Supabase...");

  const { error: catError } = await supabase.from("categories").upsert(
    categories.map((c: { slug: string; index: string; name: { es: string; en: string }; enabled: boolean; kind?: string; clients: string[]; image?: string }) => ({
      slug: c.slug,
      index: c.index,
      name_es: c.name.es,
      name_en: c.name.en,
      enabled: c.enabled,
      kind: c.kind ?? null,
      clients: c.clients,
      image: c.image ?? null,
    })),
  );
  if (catError) throw catError;
  console.log("  ✓ categories");

  const { error: teamError } = await supabase.from("team_members").upsert(
    team.map((m: { slug: string; name: string; role: { es: string; en: string }; photoUrl?: string }, i: number) => ({
      slug: m.slug,
      name: m.name,
      role_es: m.role.es,
      role_en: m.role.en,
      photo_url: m.photoUrl ?? null,
      sort_order: i,
    })),
  );
  if (teamError) throw teamError;
  console.log("  ✓ team_members");

  const { error: clientsError } = await supabase.from("clients").upsert(
    clients.map((c: { slug: string; name: string; logoUrl?: string }, i: number) => ({
      slug: c.slug,
      name: c.name,
      logo_url: c.logoUrl ?? null,
      sort_order: i,
    })),
  );
  if (clientsError) throw clientsError;
  console.log("  ✓ clients");

  const { error: contentError } = await supabase
    .from("site_content")
    .upsert(Object.entries(content).map(([id, data]) => ({ id, data })));
  if (contentError) throw contentError;
  console.log("  ✓ site_content");

  console.log("\nSupabase sincronizado.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
