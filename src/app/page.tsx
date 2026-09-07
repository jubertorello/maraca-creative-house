import type { Metadata } from "next";
import HeroVideo from "@/components/landing/HeroVideo";
import AboutIntro from "@/components/landing/AboutIntro";
import Services from "@/components/landing/Services";
import BrandsCarousel from "@/components/landing/BrandsCarousel";
import RecentWork from "@/components/landing/RecentWork";

export const metadata: Metadata = {
  title: "MARACA — Creative House | Agencia Creativa en Madrid",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <HeroVideo />
      <AboutIntro />
      <Services />
      <BrandsCarousel />
      <RecentWork />
    </>
  );
}
