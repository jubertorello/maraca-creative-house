import { readSiteContent } from "@/lib/admin-data";
import HomeManager from "./HomeManager";

export default async function AdminHomePage() {
  const home = await readSiteContent("home");
  return <HomeManager home={home} />;
}
