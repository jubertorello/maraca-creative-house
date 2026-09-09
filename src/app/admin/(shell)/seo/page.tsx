import { readSiteContent } from "@/lib/admin-data";
import SeoManager from "./SeoManager";

export default async function AdminSeoPage() {
  const seo = await readSiteContent("seo");
  return <SeoManager seo={seo} />;
}
