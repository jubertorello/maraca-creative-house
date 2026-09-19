"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import type { ContactContent } from "@/lib/site-content";

/** Contact — Figma "work general" > Contact Us Hero (6128:264). Tagline,
 * email and title editable from /admin/contact. */

const FALLBACK: ContactContent = {
  tagline: {
    es: "We're in Madrid, \nbut good ideas tend to travel:",
    en: "We're in Madrid, \nbut good ideas tend to travel:",
  },
  email: "hello@lamaraca.com",
  title: { es: "Got something in mind?", en: "Got something in mind?" },
};

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPageClient({
  content = FALLBACK,
}: {
  content?: ContactContent;
}) {
  const { t } = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [consent, setConsent] = useState(false);

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
    <section className="-mt-20 min-h-[100svh] bg-cream px-6 pt-24 pb-20 text-ink md:-mt-[120px] md:px-[120px] md:pt-32 md:pb-24">
      {/* centred italic tagline */}
      <p className="mx-auto max-w-xl text-center font-serif text-[clamp(1.4rem,4vw,1.875rem)] font-light italic leading-[1.2] tracking-[-0.05em]">
        {t(content.tagline)
          .split("\n")
          .map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        <a
          href={`mailto:${content.email}`}
          className="inline-block border-b border-transparent pb-0.5 text-red transition-colors hover:border-red"
        >
          {content.email}
        </a>
      </p>

      <div className="mx-auto mt-20 max-w-3xl">
        {/* Centered — this got reverted to left-aligned by mistake in an
            earlier pass while trying to match a reference screenshot.
            Stays centered; the form below shares this same max-w-3xl
            mx-auto block, so its width is centered too. */}
        <h1 className="text-center font-serif text-[clamp(1.75rem,3.06vw,2.75rem)] font-light uppercase leading-[1.2] tracking-[-0.06em]">
          {t(content.title)
            .split("\n")
            .map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
        </h1>

        {status === "sent" ? (
          <p className="mt-16 font-serif text-2xl font-light">
            {t({
              es: "¡Gracias! Te escribimos en breve.",
              en: "Thanks! We'll be in touch shortly.",
            })}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-14 max-w-lg space-y-6">
            <Field name="name" label={t({ es: "Nombre", en: "Name" })} />
            <Field name="email" label="Email" type="email" />
            <Field
              name="message"
              label={t({
                es: "Deja tu mensaje, we're listening",
                en: "Leave your message, we're listening",
              })}
              textarea
            />
            <label className="flex items-center gap-3 text-[12px] leading-tight text-ink">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                // appearance-none drops the browser's own checkbox chrome
                // (which was rendering a filled/inset box in some browsers
                // that didn't match the page background) — bg-cream keeps
                // it blending into the page until checked, when it fills
                // solid ink instead, no separate checkmark icon needed.
                className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[2px] border border-ink bg-cream transition-colors checked:bg-ink"
              />
              <span>
                {t({ es: "He leído y acepto la ", en: "I've read and accept the " })}
                <Link href="/privacy-policy" className="underline hover:text-ink">
                  {t({ es: "política de privacidad", en: "privacy policy" })}
                </Link>
                .
              </span>
            </label>
            <div className="pt-2">
              <div className="flex items-center gap-6">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="border border-ink bg-transparent px-6 py-2.5 text-[11px] uppercase tracking-[0.15em] text-ink transition-colors hover:border-red hover:text-red disabled:opacity-40"
                >
                  {status === "sending"
                    ? t({ es: "Enviando…", en: "Sending…" })
                    : t({ es: "Enviar", en: "Send" })}
                </button>
              </div>
              {status === "error" && (
                <p className="mt-3 text-xs text-red">
                  {t({
                    es: `No se pudo enviar. Probá de nuevo o escribinos directo a ${content.email}.`,
                    en: `Couldn't send. Try again or email us directly at ${content.email}.`,
                  })}
                </p>
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
  // The label lives *in* the field as a placeholder (native browser
  // behavior: visible until you start typing, gone the moment there's a
  // value) instead of sitting above it — aria-label keeps it announced to
  // screen readers once the visible copy is gone.
  const cls =
    "w-full border-b border-ink bg-transparent pb-3 pt-0 leading-tight text-ink outline-none transition-colors placeholder:text-[14px] placeholder:font-extralight placeholder:uppercase placeholder:tracking-[-0.05em] placeholder:text-ink focus:border-red";
  return textarea ? (
    <textarea
      name={name}
      required
      rows={3}
      placeholder={label}
      aria-label={label}
      className={cls}
    />
  ) : (
    <input
      name={name}
      type={type}
      required
      placeholder={label}
      aria-label={label}
      className={cls}
    />
  );
}
