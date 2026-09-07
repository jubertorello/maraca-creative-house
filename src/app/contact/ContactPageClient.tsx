"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n";

/** Contact — Figma "work general" > Contact Us Hero (6128:264). */

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPageClient() {
  const { t } = useLocale();
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="-mt-20 min-h-[100svh] bg-cream px-6 pt-40 pb-20 text-ink md:-mt-[120px] md:px-[120px] md:pt-[216px] md:pb-24">
      {/* centred italic tagline */}
      <p className="mx-auto max-w-xl text-center font-serif text-[clamp(1.1rem,2.08vw,1.875rem)] font-light italic leading-[1.2] tracking-[-0.05em]">
        {t({
          es: "We're in Madrid, but good ideas tend to travel:",
          en: "We're in Madrid, but good ideas tend to travel:",
        })}
        <br />
        <a
          href="mailto:hello@lamaraca.com"
          className="text-red transition-opacity hover:opacity-70"
        >
          hello@lamaraca.com
        </a>
      </p>

      <div className="mx-auto mt-20 max-w-3xl">
        <h1 className="font-serif text-[clamp(1.75rem,3.06vw,2.75rem)] font-light uppercase leading-[1.2] tracking-[-0.06em]">
          {t({ es: "Got something in mind?", en: "Got something in mind?" })}
        </h1>

        {status === "sent" ? (
          <p className="mt-16 font-serif text-2xl font-light">
            {t({
              es: "¡Gracias! Te escribimos en breve.",
              en: "Thanks! We'll be in touch shortly.",
            })}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-16 space-y-10">
            <Field name="name" label={t({ es: "Nombre", en: "Name" })} />
            <Field name="email" label="Email" type="email" />
            <Field
              name="message"
              label={t({
                es: "Deja tu mensaje, te escuchamos",
                en: "Leave your message, we're listening",
              })}
              textarea
            />
            <div className="flex items-center gap-6 pt-2">
              <button
                type="submit"
                disabled={status === "sending"}
                className="border border-ink px-6 py-2 text-[11px] uppercase tracking-[0.15em] transition-colors hover:border-red hover:text-red disabled:opacity-50"
              >
                {status === "sending"
                  ? t({ es: "Enviando…", en: "Sending…" })
                  : t({ es: "Enviar", en: "Send" })}
              </button>
              {status === "error" && (
                <span className="text-xs text-red">
                  {t({
                    es: "No se pudo enviar. Escríbenos a hello@lamaraca.com.",
                    en: "Couldn't send. Email hello@lamaraca.com.",
                  })}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  textarea = false,
}: {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full border-b border-ink/40 bg-transparent pb-1 pt-0 leading-tight text-ink outline-none transition-colors focus:border-ink";
  return (
    <label className="block">
      <span className="mb-1 block text-[14px] font-extralight uppercase leading-[1.2] tracking-[-0.05em] text-ink">
        {label}
      </span>
      {textarea ? (
        <textarea name={name} required rows={3} className={cls} />
      ) : (
        <input name={name} type={type} required className={cls} />
      )}
    </label>
  );
}
