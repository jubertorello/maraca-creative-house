/**
 * Team — Figma "Equipo" > Participadas (6049:575).
 *
 * Data lives in src/data/team.json (editable from /admin/team) — this file
 * just loads it, types it, and adds the live (Supabase-aware) fetcher
 * public pages should use. See src/lib/work.ts for the full explanation of
 * this pattern.
 */

import teamData from "@/data/team.json";
import { SUPABASE_ENABLED, supabasePublic } from "@/lib/supabase";

export type Member = {
  slug: string;
  name: string;
  role: { es: string; en: string };
  photoUrl?: string;
};

/** Build-time snapshot — fine for anything that only runs at build time. */
export const TEAM: Member[] = teamData as Member[];

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

/** Live (Supabase-aware) fetch — use from Server Components on the public
 * site so /admin/team edits show up without a rebuild. */
export async function getTeamLive(): Promise<Member[]> {
  if (!SUPABASE_ENABLED) return TEAM;
  const { data, error } = await supabasePublic()
    .from("team_members")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  if (!data || data.length === 0) return TEAM;
  return (data as MemberRow[]).map(memberFromRow);
}
