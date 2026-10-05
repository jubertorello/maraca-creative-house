import { readSiteContent } from "@/lib/admin-data";
import PrivacyPolicyManager from "../privacy-policy/PrivacyPolicyManager";

export default async function AdminLegalNoticePage() {
  const content = await readSiteContent("legalNotice");
  return (
    <PrivacyPolicyManager
      content={content}
      contentId="legalNotice"
      title="Aviso legal"
      route="/legal-notice"
    />
  );
}
