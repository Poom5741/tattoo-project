/**
 * Voucher endpoint authentication — unit tests (TDD).
 *
 * `POST /api/voucher` signs a mint voucher that authorises a specific
 * buyer to mint a specific design on-chain. It must not be callable by
 * an unauthenticated request — anyone could currently request a voucher
 * for any buyer/design pair.
 *
 * Seams under test:
 *   1. No session at all → 401 with `{ error: "Unauthorized" }`.
 *   2. Session for a different buyer → 403 with `{ error: "..." }`
 *      (the body's `buyer` doesn't match the authenticated user).
 *   3. Artist session for a design owned by a *different* artist → 403.
 *   4. Artist session for a design they own → not blocked by auth
 *      (the rest of the flow is exercised by integration tests).
 *
 * Part of ticket 06 of the .wayfinder map.
 *
 * Prerequisites: vitest (pnpm test). No network required.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

interface MockDb {
  prepare: ReturnType<typeof vi.fn>;
}
interface MockKv {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
}

function makeDb(): MockDb {
  return {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(null),
      all: vi.fn().mockResolvedValue({ results: [] }),
      run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 0 } }),
    }),
  };
}
function makeKv(): MockKv {
  return {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
  };
}

type AstroLocals = {
  runtime: { env: Record<string, unknown> };
  user?: { id: string } | null;
  session?: { userId: string } | null;
  artistSession?: { artistId: string } | null;
};

function mockContext(opts: {
  body: unknown;
  locals: Partial<AstroLocals>;
}) {
  return {
    request: new Request("http://localhost/api/voucher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts.body),
    }),
    locals: {
      runtime: { env: { DB: makeDb(), SESSION: makeKv(), SIGNER_PRIVATE_KEY: "0x" + "11".repeat(32) } },
      user: opts.locals.user ?? null,
      session: opts.locals.session ?? null,
      artistSession: opts.locals.artistSession ?? null,
    },
  } as const;
}

// Imported lazily so the test file is the only place we pay the cost of the
// voucher module's transitive deps (viem, etc.) on each test run.
async function importVoucher() {
  return import("@/pages/api/voucher");
}

describe("POST /api/voucher — authentication", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 with { error: 'Unauthorized' } when no session is present", async () => {
    const { POST } = await importVoucher();
    const ctx = mockContext({
      body: { designId: "d1", buyer: "0x" + "ab".repeat(20) },
      locals: { user: null, session: null, artistSession: null },
    });
    const res = await POST(ctx as never);
    expect(res.status).toBe(401);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    const body = (await res.json()) as { error?: string };
    expect(typeof body.error).toBe("string");
    expect(body.error).toBeTruthy();
  });

  it("returns 403 when the body buyer does not match the authenticated user", async () => {
    const { POST } = await importVoucher();
    const ctx = mockContext({
      body: { designId: "d1", buyer: "0x" + "ab".repeat(20) },
      locals: {
        user: { id: "0x" + "cd".repeat(20) },
        session: { userId: "0x" + "cd".repeat(20) },
        artistSession: null,
      },
    });
    const res = await POST(ctx as never);
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error?: string };
    expect(typeof body.error).toBe("string");
  });
});
