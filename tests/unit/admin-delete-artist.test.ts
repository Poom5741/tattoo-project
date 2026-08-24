/**
 * Admin delete artist API — unit tests.
 *
 * Tests the POST /api/admin/delete-artist handler for auth,
 * validation, success, and error cases (ticket #92).
 *
 * Prerequisites: vitest (pnpm test). No network required.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { POST } from "@/pages/api/admin/delete-artist";

/* ── Mock helpers ── */

interface MockKv {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
}

function mockKv(): MockKv {
  return {
    get: vi.fn<() => Promise<string | null>>().mockResolvedValue("1"),
    put: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    delete: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    list: vi.fn(),
  };
}

function mockDb(opts: {
  existing?: { id: string; deleted_at: number | null } | null;
  runError?: boolean;
} = {}) {
  const firstFn = vi.fn().mockResolvedValue(
    opts.existing === undefined ? null : (opts.existing ?? null),
  );
  const runFn = opts.runError
    ? vi.fn().mockRejectedValue(new Error("D1 error"))
    : vi.fn().mockResolvedValue({});

  return {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        first: firstFn,
        run: runFn,
      }),
    }),
  };
}

function mockContext(body?: BodyInit, kvOverride?: MockKv, dbOverride?: ReturnType<typeof mockDb>, authed = true) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authed) {
    headers["Cookie"] = "admin_token=test-token";
  }
  return {
    request: new Request("http://localhost/api/admin/delete-artist", {
      method: "POST",
      headers,
      body,
    }),
    locals: {
      runtime: {
        env: {
          SESSION: kvOverride ?? mockKv(),
          DB: dbOverride ?? mockDb(),
        },
      },
    },
  } as const;
}

/* ── Tests ── */

describe("POST /api/admin/delete-artist", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    const kv = mockKv();
    kv.get.mockResolvedValue(null); // no session
    const ctx = mockContext(
      JSON.stringify({ artistId: "mara" }),
      kv,
    );
    const res = await POST(ctx as never);
    expect(res.status).toBe(401);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 for invalid JSON body", async () => {
    const ctx = mockContext("not-json");
    const res = await POST(ctx as never);
    expect(res.status).toBe(400);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe("Invalid request body");
  });

  it("returns 400 when artistId is missing", async () => {
    const ctx = mockContext(JSON.stringify({}));
    const res = await POST(ctx as never);
    expect(res.status).toBe(400);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe("artistId is required");
  });

  it("returns 400 when artistId is empty string", async () => {
    const ctx = mockContext(JSON.stringify({ artistId: "  " }));
    const res = await POST(ctx as never);
    expect(res.status).toBe(400);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe("artistId is required");
  });

  it("returns 404 when artist does not exist", async () => {
    const db = mockDb({ existing: null });
    const ctx = mockContext(JSON.stringify({ artistId: "nonexistent" }), undefined, db);
    const res = await POST(ctx as never);
    expect(res.status).toBe(404);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe("Artist not found");
  });

  it("returns 400 when artist is already deleted", async () => {
    const db = mockDb({ existing: { id: "mara", deleted_at: 1700000000 } });
    const ctx = mockContext(JSON.stringify({ artistId: "mara" }), undefined, db);
    const res = await POST(ctx as never);
    expect(res.status).toBe(400);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe("Artist is already deleted");
  });

  it("returns 200 and soft-deletes artist", async () => {
    const db = mockDb({ existing: { id: "mara", deleted_at: null } });
    const ctx = mockContext(JSON.stringify({ artistId: "mara" }), undefined, db, true);
    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.success).toBe(true);

    // Verify DB.prepare was called twice: SELECT then UPDATE
    expect(db.prepare).toHaveBeenCalledTimes(2);
    const updateCall = db.prepare.mock.calls[1];
    expect(updateCall[0]).toContain("UPDATE artists SET deleted_at");
  });

  it("returns 500 on database error", async () => {
    const db = mockDb({ existing: { id: "mara", deleted_at: null }, runError: true });
    const ctx = mockContext(JSON.stringify({ artistId: "mara" }), undefined, db, true);
    const res = await POST(ctx as never);
    expect(res.status).toBe(500);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe("Internal server error");
  });
});
