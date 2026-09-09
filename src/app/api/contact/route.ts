import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isRateLimited, recordHit, clientIp } from "@/lib/rate-limit";

const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Contact form endpoint. Needs env vars:
 *   RESEND_API_KEY      — from resend.com
 *   CONTACT_TO          — inbox that receives submissions (e.g. hello@lamaraca.com)
 *   CONTACT_FROM        — a verified sender on your Resend domain
 *                         (e.g. "MARACA web <web@lamaraca.com>")
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (isRateLimited("contact", ip, MAX_SUBMISSIONS, WINDOW_MS)) {
    return NextResponse.json(
      { error: "Demasiados mensajes. Probá de nuevo más tarde." },
      { status: 429 },
    );
  }
  recordHit("contact", ip, WINDOW_MS);

  let data: { name?: string; email?: string; message?: string };
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = data.name?.trim();
  const email = data.email?.trim();
  const message = data.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;

  if (!apiKey || !to || !from) {
    console.error("Contact: missing RESEND_API_KEY / CONTACT_TO / CONTACT_FROM");
    return NextResponse.json(
      { error: "Email not configured" },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `Nuevo mensaje de ${name} — maraca.house`,
    text: `Nombre: ${name}\nEmail: ${email}\n\n${message}`,
  });

  if (error) {
    console.error("Contact: Resend error", error);
    return NextResponse.json({ error: "Send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
