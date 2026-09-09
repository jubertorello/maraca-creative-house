import { readSiteContent } from "@/lib/admin-data";
import PrivacyPolicyManager from "./PrivacyPolicyManager";

export default async function AdminPrivacyPolicyPage() {
  const content = await readSiteContent("privacyPolicy");
  return <PrivacyPolicyManager content={content} />;
}
