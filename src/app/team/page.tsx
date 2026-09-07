import type { Metadata } from "next";
import TeamPageClient from "./TeamPageClient";

const description =
  "Conoce al equipo de MARACA, agencia creativa de Madrid: dirección de estrategia, dirección creativa, contenido y social media.";

export const metadata: Metadata = {
  title: "El equipo",
  description,
  alternates: { canonical: "/team" },
  openGraph: { title: "El equipo | MARACA", description },
};

export default function TeamPage() {
  return <TeamPageClient />;
}
