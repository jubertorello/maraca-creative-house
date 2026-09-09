import { readSiteContent, readTeam } from "@/lib/admin-data";
import TeamManager from "./TeamManager";

export default async function AdminTeamPage() {
  const [content, team] = await Promise.all([readSiteContent("team"), readTeam()]);
  return <TeamManager content={content} team={team} />;
}
