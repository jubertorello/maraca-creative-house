import type { Metadata } from "next";
import TeamPageClient from "./TeamPageClient";
import { getTeamContentLive, getSeoContentLive } from "@/lib/site-content";
import { getTeamLive } from "@/lib/team";
import { clip, pageSocial } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContentLive();
  const page = seo.pages.team;
  const title = page.title || "El equipo";
  const description = page.description ? clip(page.description) : undefined;
  return {
    title,
    description,
    alternates: { canonical: "/team" },
    ...(await pageSocial({ title, description, path: "/team" })),
  };
}

export default async function TeamPage() {
  const [content, team] = await Promise.all([getTeamContentLive(), getTeamLive()]);
  return <TeamPageClient content={content} team={team} />;
}
