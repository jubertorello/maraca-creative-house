import { createClient } from "@supabase/supabase-js";

/** True once real Supabase credentials are set — everything that touches
 * content data checks this to decide between Supabase and the local JSON
 * fallback (src/data/*.json), so the app keeps working before you connect
 * Supabase and switches over cleanly the moment you do. */
export const SUPABASE_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

/** Server-only client using the service role key — bypasses Row Level
 * Security, so only ever use this from server code (API routes, admin
 * data layer), never send it to the browser. */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase no está configurado — faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/** Public, read-only client using the anon key — safe to use from Server
 * Components that render the public site. */
export function supabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase no está configurado — faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
