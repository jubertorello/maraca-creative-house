import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword } from "@/lib/admin-auth";

/** Gate everything under /admin (except the login page itself and its API)
 * behind the ADMIN_PASSWORD cookie. See src/lib/admin-auth.ts.
 * (Named `proxy`, not `middleware` — this Next.js version renamed the file
 * convention; see node_modules/next/dist/docs/.../proxy.md.) */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/login")
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (checkPassword(cookie ?? "", process.env.ADMIN_PASSWORD)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
