"use client";

import { useLocale } from "@/lib/i18n";

/**
 * Política de privacidad. On-brand shell (cream, serif headings, Bricolage
 * body). The section copy is PLACEHOLDER — replace with the real legal text
 * (should be reviewed by legal / adapted to the actual data practices).
 */

type Section = {
  heading: { es: string; en: string };
  body: { es: string; en: string };
};

const SECTIONS: Section[] = [
  {
    heading: { es: "Responsable del tratamiento", en: "Data controller" },
    body: {
      es: "MARACA (en adelante, «la agencia») es responsable del tratamiento de los datos personales que nos facilites a través de este sitio web. Puedes contactarnos en hello@lamaraca.com.",
      en: "MARACA (\"the agency\") is the controller of the personal data you provide through this website. You can reach us at hello@lamaraca.com.",
    },
  },
  {
    heading: { es: "Datos que recogemos", en: "Data we collect" },
    body: {
      es: "A través del formulario de contacto recogemos el nombre, la dirección de correo electrónico y el mensaje que nos envías. No recogemos categorías especiales de datos.",
      en: "Through the contact form we collect the name, email address and message you send us. We do not collect special categories of data.",
    },
  },
  {
    heading: { es: "Finalidad y base legal", en: "Purpose and legal basis" },
    body: {
      es: "Usamos tus datos únicamente para responder a tu consulta y, en su caso, gestionar una posible colaboración. La base legal es tu consentimiento y el interés legítimo en atender tu solicitud.",
      en: "We use your data only to respond to your enquiry and, where applicable, to manage a possible collaboration. The legal basis is your consent and our legitimate interest in handling your request.",
    },
  },
  {
    heading: { es: "Conservación", en: "Retention" },
    body: {
      es: "Conservamos los datos durante el tiempo necesario para atender tu consulta y, después, durante los plazos legalmente exigibles.",
      en: "We keep the data for as long as needed to handle your enquiry and, afterwards, for the periods required by law.",
    },
  },
  {
    heading: { es: "Destinatarios", en: "Recipients" },
    body: {
      es: "No cedemos tus datos a terceros salvo obligación legal. Utilizamos proveedores de servicios (por ejemplo, de envío de correo electrónico) que actúan como encargados del tratamiento.",
      en: "We do not share your data with third parties except where legally required. We use service providers (e.g. email delivery) acting as processors.",
    },
  },
  {
    heading: { es: "Tus derechos", en: "Your rights" },
    body: {
      es: "Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a hello@lamaraca.com. También puedes reclamar ante la autoridad de control competente.",
      en: "You can exercise your rights of access, rectification, erasure, objection, restriction and portability by writing to hello@lamaraca.com. You may also lodge a complaint with the competent supervisory authority.",
    },
  },
];

export default function PrivacyPolicyClient() {
  const { t } = useLocale();

  return (
    <section className="-mt-20 bg-cream px-6 pt-44 pb-24 text-ink md:-mt-[120px] md:px-[120px] md:pt-[248px] md:pb-32">
      <div className="mx-auto max-w-[760px]">
        <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-light uppercase leading-[1.15] tracking-[-0.04em]">
          {t({ es: "Política de privacidad", en: "Privacy Policy" })}
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.15em] text-ink/50">
          {t({
            es: "Última actualización: septiembre 2026",
            en: "Last updated: September 2026",
          })}
        </p>

        <div className="mt-16 space-y-12">
          {SECTIONS.map((s, i) => (
            <div key={i}>
              <h2 className="font-serif text-xl font-light uppercase leading-tight tracking-[-0.03em]">
                {t(s.heading)}
              </h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink/75">
                {t(s.body)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
