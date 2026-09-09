/**
 * Clients / brands. Figma "About us" logos section (6081:450) + landing
 * carousel (6183:1245).
 *
 * Data lives in src/data/clients.json (editable from /admin/clients) —
 * this file just loads it, types it, and adds the live (Supabase-aware)
 * fetcher public pages should use. See src/lib/work.ts for the same
 * pattern, explained in full there.
 */

import clientsData from "@/data/clients.json";
import { SUPABASE_ENABLED, supabasePublic } from "@/lib/supabase";

export type Client = { name: string; slug: string; logoUrl?: string };

/** Build-time snapshot — fine for anything that only runs at build time. */
export const CLIENTS: Client[] = clientsData as Client[];

/** Only the clients that have a real logo (dynamic — grows via the CMS). */
export const CLIENTS_WITH_LOGO = CLIENTS.filter((c) => c.logoUrl);

type ClientRow = { slug: string; name: string; logo_url: string | null; sort_order: number };

const clientFromRow = (r: ClientRow): Client => ({
  name: r.name,
  slug: r.slug,
  logoUrl: r.logo_url ?? undefined,
});

/** Live (Supabase-aware) fetch — use from Server Components on the public
 * site so /admin/clients edits show up without a rebuild. */
export async function getClientsLive(): Promise<Client[]> {
  if (!SUPABASE_ENABLED) return CLIENTS;
  const { data, error } = await supabasePublic()
    .from("clients")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  if (!data || data.length === 0) return CLIENTS;
  return (data as ClientRow[]).map(clientFromRow);
}

export async function getClientsWithLogoLive(): Promise<Client[]> {
  return (await getClientsLive()).filter((c) => c.logoUrl);
}
