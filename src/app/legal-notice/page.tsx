import type { Metadata } from "next";
import PrivacyPolicyClient from "../privacy-policy/PrivacyPolicyClient";
import { getLegalNoticeContentLive } from "@/lib/site-content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Aviso legal",
  robots: { index: false, follow: true },
  alternates: { canonical: "/legal-notice" },
};

export default async function LegalNoticePage() {
  const content = await getLegalNoticeContentLive();
  return <PrivacyPolicyClient content={content} title={{ es: "Aviso legal", en: "Legal Notice" }} />;
}
