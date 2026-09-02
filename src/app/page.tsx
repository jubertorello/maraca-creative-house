import HeroVideo from "@/components/landing/HeroVideo";
import AboutIntro from "@/components/landing/AboutIntro";
import Services from "@/components/landing/Services";
import BrandsCarousel from "@/components/landing/BrandsCarousel";
import RecentWork from "@/components/landing/RecentWork";

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
