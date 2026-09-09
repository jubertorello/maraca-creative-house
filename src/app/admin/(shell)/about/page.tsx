import { readSiteContent, readClients } from "@/lib/admin-data";
import AboutManager from "./AboutManager";

export default async function AdminAboutPage() {
  const [about, clients] = await Promise.all([readSiteContent("about"), readClients()]);
  return <AboutManager about={about} clients={clients} />;
}
