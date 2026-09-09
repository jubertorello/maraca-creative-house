/**
 * Best-effort per-key rate limiter — N hits per key within a rolling
 * window. In-memory, so it resets on redeploy/restart and doesn't share
 * state across multiple server instances; a real defense against a
 * sustained distributed attack needs a shared store (e.g. Upstash Redis).
 * For this site's traffic it's still a meaningful bar against casual or
 * scripted abuse of /api/admin/login and /api/contact.
 */
type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

export function isRateLimited(namespace: string, key: string, max: number, windowMs: number): boolean {
  const bucket = buckets.get(`${namespace}:${key}`);
  if (!bucket) return false;
  if (Date.now() - bucket.windowStart > windowMs) {
    buckets.delete(`${namespace}:${key}`);
    return false;
  }
  return bucket.count >= max;
}

export function recordHit(namespace: string, key: string, windowMs: number): void {
  const fullKey = `${namespace}:${key}`;
  const bucket = buckets.get(fullKey);
  const now = Date.now();
  if (!bucket || now - bucket.windowStart > windowMs) {
    buckets.set(fullKey, { count: 1, windowStart: now });
  } else {
    bucket.count += 1;
  }
}

export function clearHits(namespace: string, key: string): void {
  buckets.delete(`${namespace}:${key}`);
}

export function clientIp(req: Request): string {
  const headers = req.headers;
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
