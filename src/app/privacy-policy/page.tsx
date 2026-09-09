import type { Metadata } from "next";
import PrivacyPolicyClient from "./PrivacyPolicyClient";
import { getSeoContentLive, getPrivacyPolicyContentLive } from "@/lib/site-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContentLive();
  const page = seo.pages.privacyPolicy;
  return {
    title: page.title || "Política de privacidad",
    robots: { index: false, follow: true },
    alternates: { canonical: "/privacy-policy" },
  };
}

export default async function PrivacyPolicyPage() {
  const content = await getPrivacyPolicyContentLive();
  return <PrivacyPolicyClient content={content} />;
}
