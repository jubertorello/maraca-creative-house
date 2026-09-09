import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword } from "@/lib/admin-auth";
import { isRateLimited, recordHit, clearHits, clientIp } from "@/lib/rate-limit";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  // Best-effort per-IP throttle against password guessing — see
  // src/lib/rate-limit.ts for what this does and doesn't protect against.
  const ip = clientIp(req);

  if (isRateLimited("admin-login", ip, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá de nuevo en unos minutos." },
      { status: 429 },
    );
  }

  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };

  if (!checkPassword(password ?? "", process.env.ADMIN_PASSWORD)) {
    recordHit("admin-login", ip, WINDOW_MS);
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  clearHits("admin-login", ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, password!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
