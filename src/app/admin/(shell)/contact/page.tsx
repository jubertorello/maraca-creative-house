import { readSiteContent } from "@/lib/admin-data";
import ContactManager from "./ContactManager";

export default async function AdminContactPage() {
  const content = await readSiteContent("contact");
  return <ContactManager content={content} />;
}
