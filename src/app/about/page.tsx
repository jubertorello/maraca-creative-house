import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";
import { getAboutContentLive, getSeoContentLive } from "@/lib/site-content";
import { getClientsLive } from "@/lib/clients";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContentLive();
  const page = seo.pages.about;
  const description = page.description || undefined;
  return {
    title: page.title || "Sobre nosotros",
    description,
    alternates: { canonical: "/about" },
    openGraph: description ? { title: `${page.title || "Sobre nosotros"} | MARACA`, description } : undefined,
  };
}

export default async function AboutPage() {
  const [content, clients] = await Promise.all([getAboutContentLive(), getClientsLive()]);
  return <AboutPageClient content={content} clients={clients} />;
}
