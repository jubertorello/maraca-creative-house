"use client";

import { useLocale } from "@/lib/i18n";
import type { PrivacyPolicyContent } from "@/lib/site-content";

/** Política de privacidad. On-brand shell (cream, serif headings, Bricolage
 * body). Content editable from /admin/privacy-policy. */

const FALLBACK: PrivacyPolicyContent = {
  lastUpdated: { es: "septiembre 2026", en: "September 2026" },
  sections: [
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
  ],
};

export default function PrivacyPolicyClient({
  content = FALLBACK,
}: {
  content?: PrivacyPolicyContent;
}) {
  const { t } = useLocale();

  return (
    <section className="-mt-20 bg-cream px-6 pt-44 pb-24 text-ink md:-mt-[120px] md:px-[120px] md:pt-[248px] md:pb-32">
      <div className="mx-auto max-w-[760px]">
        <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-light uppercase leading-[1.15] tracking-[-0.04em]">
          {t({ es: "Política de privacidad", en: "Privacy Policy" })}
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.15em] text-ink/50">
          {t({
            es: `Última actualización: ${content.lastUpdated.es}`,
            en: `Last updated: ${content.lastUpdated.en}`,
          })}
        </p>

        <div className="mt-16 space-y-12">
          {content.sections.map((s, i) => (
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
