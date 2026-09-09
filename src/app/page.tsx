import type { Metadata } from "next";
import HeroVideo from "@/components/landing/HeroVideo";
import AboutIntro from "@/components/landing/AboutIntro";
import Services from "@/components/landing/Services";
import BrandsCarousel from "@/components/landing/BrandsCarousel";
import RecentWork from "@/components/landing/RecentWork";
import { getHomeContentLive, getSeoContentLive } from "@/lib/site-content";
import { getClientsWithLogoLive } from "@/lib/clients";
import { getEnabledCategoriesLive, getCasesLive } from "@/lib/work";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContentLive();
  const page = seo.pages.home;
  return {
    // A plain string here (not going through the layout's title template)
    // is intentional — Home is the site's own "brand" title, not "X | Home".
    title: page.title || seo.global.defaultTitle,
    ...(page.description ? { description: page.description } : {}),
    alternates: { canonical: "/" },
  };
}

export default async function Home() {
  const [content, clients, categories, cases] = await Promise.all([
    getHomeContentLive(),
    getClientsWithLogoLive(),
    getEnabledCategoriesLive(),
    getCasesLive(),
  ]);

  return (
    <>
      <HeroVideo video={content.heroVideo} />
      <AboutIntro text={content.aboutText} />
      <Services categories={categories} cases={cases} />
      <BrandsCarousel clients={clients} />
      <RecentWork video={content.recentWorkVideo} />
    </>
  );
}
