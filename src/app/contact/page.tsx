import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

const description =
  "¿Tienes algo en mente? Escríbenos a hello@lamaraca.com — MARACA, agencia creativa de Madrid especializada en branding, publicidad y eventos.";

export const metadata: Metadata = {
  title: "Contacto",
  description,
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contacto | MARACA", description },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
