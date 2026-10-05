import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";
import { getAboutContentLive, getSeoContentLive } from "@/lib/site-content";
import { getClientsLive } from "@/lib/clients";
import { clip, pageSocial } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContentLive();
  const page = seo.pages.about;
  const title = page.title || "Sobre nosotros";
  const description = page.description ? clip(page.description) : undefined;
  return {
    title,
    description,
    alternates: { canonical: "/about" },
    ...(await pageSocial({ title, description, path: "/about" })),
  };
}

export default async function AboutPage() {
  const [content, clients] = await Promise.all([getAboutContentLive(), getClientsLive()]);
  return <AboutPageClient content={content} clients={clients} />;
}
