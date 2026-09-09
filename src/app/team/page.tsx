import type { Metadata } from "next";
import TeamPageClient from "./TeamPageClient";
import { getTeamContentLive, getSeoContentLive } from "@/lib/site-content";
import { getTeamLive } from "@/lib/team";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContentLive();
  const page = seo.pages.team;
  const title = page.title || "El equipo";
  const description = page.description || undefined;
  return {
    title,
    description,
    alternates: { canonical: "/team" },
    openGraph: description ? { title: `${title} | MARACA`, description } : undefined,
  };
}

export default async function TeamPage() {
  const [content, team] = await Promise.all([getTeamContentLive(), getTeamLive()]);
  return <TeamPageClient content={content} team={team} />;
}
