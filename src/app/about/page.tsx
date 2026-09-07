import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

const description =
  "Somos MARACA, una agencia creativa boutique en Madrid especializada en branding, estrategia y creatividad — construimos marcas con criterio estético e ideas capaces de vivir en cualquier formato.";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description,
  alternates: { canonical: "/about" },
  openGraph: { title: "Sobre nosotros | MARACA", description },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
