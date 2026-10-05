import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";
import { getSeoContentLive, getContactContentLive } from "@/lib/site-content";
import { clip, pageSocial } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContentLive();
  const page = seo.pages.contact;
  const title = page.title || "Contacto";
  const description = page.description ? clip(page.description) : undefined;
  return {
    title,
    description,
    alternates: { canonical: "/contact" },
    ...(await pageSocial({ title, description, path: "/contact" })),
  };
}

export default async function ContactPage() {
  const content = await getContactContentLive();
  return <ContactPageClient content={content} />;
}
