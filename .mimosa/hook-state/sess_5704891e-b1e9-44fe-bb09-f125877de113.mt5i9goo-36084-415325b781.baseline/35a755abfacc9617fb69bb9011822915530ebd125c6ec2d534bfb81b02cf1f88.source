/**
 * Rate limiting — per-IP, fixed-window counter stored in KV.
 *
 * Two buckets share the same primitive but use independent budgets:
 *   - `auth`   — 5 req / 60 s (admin login, artist login, better-auth sign-in)
 *   - `submit` — 20 req / 60 s (bookings, chat send)
 *
 * The middleware asks `checkRateLimit` on every request that matches a
 * protected route and short-circuits with `rateLimitResponse(decision)`
 * when the decision is `allowed: false`.
 *
 * Implementation notes:
 *   - Fixed window (not sliding) — simpler, fewer KV reads, acceptable
 *     for the soft-launch abuse profiles we're guarding against.
 *   - The KV key is `rl:{bucket}:{ip}`. TTL equals the window so the
 *     counter self-resets.
 *   - Read-modify-write has a small race under high concurrency. Acceptable
 *     here because the consequence of a small over-count is one or two
 *     extra requests past the limit, not a security bypass.
 */

export type RateLimitBucket = "auth" | "submit";

export interface RateLimitOptions {
  ip: string;
  bucket: RateLimitBucket;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  count: number;
  limit: number;
  retryAfterSeconds: number;
}

interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

const RATE_LIMIT_KEY = (bucket: RateLimitBucket, ip: string) => `rl:${bucket}:${ip}`;

/**
 * Decide which rate-limit bucket (if any) a request belongs to.
 * Only POSTs are subject to the buckets defined here — GETs are read-only
 * and a different concern.
 */
export function classifyProtectedRoute(
  pathname: string,
  method: string
): RateLimitBucket | null {
  if (method.toUpperCase() !== "POST") return null;

  // Auth bucket — brute-force surface.
  if (pathname === "/api/admin/login") return "auth";
  if (pathname === "/api/auth/artist-login") return "auth";
  if (pathname === "/api/auth/client-login") return "auth";
  if (pathname.startsWith("/api/auth/sign-in/")) return "auth";

  // Submit bucket — spam / flooding surface.
  if (pathname === "/api/bookings") return "submit";
  if (pathname === "/api/chat/send") return "submit";
  if (pathname.startsWith("/api/chat/messages/")) return "submit";

  return null;
}

/** Extract the client IP from the standard Cloudflare / proxy headers. */
export function getClientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

/**
 * Atomically (within the limits of a single-threaded JS event loop)
 * increment the per-IP-per-bucket counter and decide whether the request
 * is allowed.
 */
export async function checkRateLimit(
  kv: KVLike,
  opts: RateLimitOptions
): Promise<RateLimitDecision> {
  const key = RATE_LIMIT_KEY(opts.bucket, opts.ip);
  const raw = await kv.get(key);
  const previous = raw ? Number.parseInt(raw, 10) : 0;
  const count = Number.isFinite(previous) ? previous + 1 : 1;
  await kv.put(key, String(count), { expirationTtl: opts.windowSeconds });
  if (count > opts.limit) {
    return {
      allowed: false,
      count,
      limit: opts.limit,
      retryAfterSeconds: opts.windowSeconds,
    };
  }
  return { allowed: true, count, limit: opts.limit, retryAfterSeconds: 0 };
}

/** Build the 429 response the middleware returns when over budget. */
export function rateLimitResponse(decision: RateLimitDecision): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please slow down and try again shortly.",
    }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "Retry-After": String(decision.retryAfterSeconds),
      },
    }
  );
}
