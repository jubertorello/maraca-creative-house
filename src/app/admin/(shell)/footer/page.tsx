import { readSiteContent } from "@/lib/admin-data";
import FooterManager from "./FooterManager";

export default async function AdminFooterPage() {
  const content = await readSiteContent("footer");
  return <FooterManager content={content} />;
}
