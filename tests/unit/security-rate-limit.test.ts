/**
 * Rate limiting — unit tests (TDD).
 *
 * Tests `checkRateLimit` and `getClientIp` from `src/lib/security/rate-limit.ts`.
 *
 * Seams under test:
 *   1. `getClientIp(request)` — extracts the client IP from the request.
 *   2. `checkRateLimit(kv, opts)` — returns a decision (allowed/count/limit/retryAfter)
 *      that the middleware uses to short-circuit with 429 when the budget is gone.
 *   3. Per-IP isolation — different IPs have independent counters.
 *   4. `rateLimitResponse(decision)` — builds the 429 Response with JSON body + Retry-After.
 *
 * Part of ticket 02 of the .wayfinder map.
 */

import { describe, it, expect } from "vitest";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  type RateLimitBucket,
} from "@/lib/security/rate-limit";

/**
 * In-memory KV stub that tracks per-key string values + TTL the way
 * Cloudflare KV would, just locally for tests. Sufficient for sliding-window
 * and fixed-window counters.
 */
function makeKv() {
  const store = new Map<string, { value: string; expiresAt: number }>();
  const now = () => Date.now();

  return {
    async get(key: string): Promise<string | null> {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= now()) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
    async put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void> {
      const ttl = opts?.expirationTtl ?? 60;
      store.set(key, { value, expiresAt: now() + ttl * 1000 });
    },
    _store: store,
  };
}

describe("getClientIp", () => {
  it("returns the cf-connecting-ip header when present", () => {
    const req = new Request("http://localhost/", {
      headers: { "cf-connecting-ip": "203.0.113.42" },
    });
    expect(getClientIp(req)).toBe("203.0.113.42");
  });

  it("falls back to x-forwarded-for first value when cf-connecting-ip missing", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "198.51.100.7, 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("198.51.100.7");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    const req = new Request("http://localhost/");
    expect(getClientIp(req)).toBe("unknown");
  });
});

describe("checkRateLimit", () => {
  it("allows the first request under the limit", async () => {
    const kv = makeKv();
    const decision = await checkRateLimit(kv as never, {
      ip: "1.1.1.1",
      bucket: "auth" as RateLimitBucket,
      limit: 5,
      windowSeconds: 60,
    });
    expect(decision.allowed).toBe(true);
    expect(decision.count).toBe(1);
    expect(decision.limit).toBe(5);
    expect(decision.retryAfterSeconds).toBe(0);
  });

  it("allows requests up to and including the limit", async () => {
    const kv = makeKv();
    for (let i = 1; i <= 5; i++) {
      const decision = await checkRateLimit(kv as never, {
        ip: "1.1.1.2",
        bucket: "auth" as RateLimitBucket,
        limit: 5,
        windowSeconds: 60,
      });
      expect(decision.allowed).toBe(true);
      expect(decision.count).toBe(i);
    }
  });

  it("denies (and reports retryAfterSeconds) when over the limit", async () => {
    const kv = makeKv();
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(kv as never, {
        ip: "1.1.1.3",
        bucket: "auth" as RateLimitBucket,
        limit: 5,
        windowSeconds: 60,
      });
    }
    const decision = await checkRateLimit(kv as never, {
      ip: "1.1.1.3",
      bucket: "auth" as RateLimitBucket,
      limit: 5,
      windowSeconds: 60,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.count).toBe(6);
    expect(decision.limit).toBe(5);
    expect(decision.retryAfterSeconds).toBeGreaterThan(0);
    expect(decision.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("isolates counters per IP (same bucket, different IPs are independent)", async () => {
    const kv = makeKv();
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(kv as never, {
        ip: "10.0.0.1",
        bucket: "auth" as RateLimitBucket,
        limit: 5,
        windowSeconds: 60,
      });
    }
    const otherIp = await checkRateLimit(kv as never, {
      ip: "10.0.0.2",
      bucket: "auth" as RateLimitBucket,
      limit: 5,
      windowSeconds: 60,
    });
    expect(otherIp.allowed).toBe(true);
    expect(otherIp.count).toBe(1);
  });

  it("isolates counters per bucket (auth and submit are independent budgets)", async () => {
    const kv = makeKv();
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(kv as never, {
        ip: "10.0.0.3",
        bucket: "auth" as RateLimitBucket,
        limit: 5,
        windowSeconds: 60,
      });
    }
    const submitDecision = await checkRateLimit(kv as never, {
      ip: "10.0.0.3",
      bucket: "submit" as RateLimitBucket,
      limit: 20,
      windowSeconds: 60,
    });
    expect(submitDecision.allowed).toBe(true);
    expect(submitDecision.count).toBe(1);
  });
});

describe("rateLimitResponse", () => {
  it("returns a 429 with a JSON body and a Retry-After header", async () => {
    const res = rateLimitResponse({
      allowed: false,
      count: 6,
      limit: 5,
      retryAfterSeconds: 42,
    });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("42");
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    const body = (await res.json()) as { error?: string };
    expect(typeof body.error).toBe("string");
    expect(body.error).toMatch(/rate.?limit|too.many/i);
  });
});
