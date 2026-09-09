import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";
import { getSeoContentLive, getContactContentLive } from "@/lib/site-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContentLive();
  const page = seo.pages.contact;
  const title = page.title || "Contacto";
  const description = page.description || undefined;
  return {
    title,
    description,
    alternates: { canonical: "/contact" },
    openGraph: description ? { title: `${title} | MARACA`, description } : undefined,
  };
}

export default async function ContactPage() {
  const content = await getContactContentLive();
  return <ContactPageClient content={content} />;
}
