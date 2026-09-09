/**
 * Minimal password gate for /admin, good enough for a single-editor local
 * backoffice. Not real auth (no per-user accounts, no roles) — replace with
 * Supabase Auth if this ever needs more than one named editor with their
 * own login and an audit trail of who changed what.
 *
 * The cookie carries the password itself (httpOnly + secure), and both the
 * login route and proxy.ts compare it against process.env.ADMIN_PASSWORD.
 * That means a leaked cookie leaks the literal login password, not just a
 * revocable session — rotating ADMIN_PASSWORD is what invalidates it.
 * checkPassword is constant-time (see below) so timing can't be used to
 * guess it faster than brute force already can; see src/lib/rate-limit.ts
 * (used from the login route) for the brute-force mitigation itself.
 *
 * Kept dependency-free (no `node:crypto`) on purpose so the check also
 * works from proxy.ts, which runs on the Edge runtime.
 */

export const ADMIN_COOKIE = "maraca_admin";

/** Constant-time string comparison — a plain `===` leaks how many leading
 * characters matched via response-time differences (a real, if slow,
 * attack against a password compared this way over the network). Walks the
 * full length of both strings regardless of where they first differ. */
function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    diff |= a.charCodeAt(i % a.length || 0) ^ b.charCodeAt(i % b.length || 0);
  }
  return diff === 0;
}

export function checkPassword(input: string, expected: string | undefined): boolean {
  if (!expected) return false;
  return timingSafeEqual(input, expected);
}
