/**
 * Small in-memory sliding-window limiter.
 *
 * This is the architecture, not the final answer: each server instance keeps its own counters.
 * On a multi-instance / serverless deployment, swap `check` for a shared store (Upstash Redis,
 * Vercel KV, a Supabase table) behind the same signature and nothing else needs to change.
 */
export type LimitResult = { ok: true } | { ok: false; retryAfter: number };

export function createLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  const prune = (now: number) => {
    for (const [k, list] of hits) {
      const fresh = list.filter((t) => now - t < windowMs);
      if (fresh.length) hits.set(k, fresh);
      else hits.delete(k);
    }
  };

  return {
    check(key: string): LimitResult {
      const now = Date.now();
      if (hits.size > 5000) prune(now);
      const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (list.length >= limit) {
        const retryAfter = Math.max(1, Math.ceil((windowMs - (now - list[0])) / 1000));
        hits.set(key, list);
        return { ok: false, retryAfter };
      }
      list.push(now);
      hits.set(key, list);
      return { ok: true };
    },
  };
}

export function clientIp(headers: Headers) {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
