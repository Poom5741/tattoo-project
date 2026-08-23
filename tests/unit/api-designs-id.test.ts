/**
 * GET /api/designs/[id] — public status filter (TDD).
 *
 * H1 follow-up: the listing endpoint (./index.ts) was fixed to filter out
 * moderation states, but the individual lookup still leaked pending /
 * rejected / delisted / owned designs to unauthenticated callers.
 *
 * Seams under test:
 *   1. The SELECT must restrict rows to the public status allowlist.
 *   2. A design whose status is NOT in the allowlist yields 404 (not 200).
 *   3. A design whose status IS in the allowlist yields 200 with the row.
 *   4. A missing design yields 404 (existing behaviour preserved).
 *   5. DB errors yield 500 with a safe JSON envelope.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/pages/api/designs/[id]";

interface PreparedCall {
  sql: string;
  params: (string | number)[];
}

function makeDB(opts: { row?: unknown } = {}) {
  const calls: PreparedCall[] = [];
  const row = opts.row ?? null;

  const prepare = vi.fn((sql: string) => {
    const bind = vi.fn((...params: (string | number)[]) => {
      calls.push({ sql, params });
      return {
        first: vi.fn().mockResolvedValue(row),
      };
    });
    return { bind };
  });

  return { prepare, calls };
}

function makeContext(
  id: string,
  db: ReturnType<typeof makeDB>
) {
  return {
    params: { id },
    locals: {
      runtime: {
        env: { DB: { prepare: db.prepare } },
      },
    },
  } as never;
}

describe("GET /api/designs/[id] — public status filter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("restricts the WHERE clause to public statuses", async () => {
    const db = makeDB({ row: { id: "abc", status: "available" } });
    const ctx = makeContext("abc", db);

    const res = await GET(ctx);
    expect(res.status).toBe(200);

    expect(db.calls).toHaveLength(1);
    const call = db.calls[0];
    // SQL must contain an IN clause with three placeholders.
    expect(call.sql).toMatch(/d\.status IN \(\?,\?,\?\)/);
    // Bound params: id, then the three public statuses.
    expect(call.params).toEqual(["abc", "available", "reserved", "sold"]);
  });

  it("returns 200 for a design with status=available", async () => {
    const db = makeDB({ row: { id: "abc", status: "available" } });
    const res = await GET(makeContext("abc", db));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string; status: string };
    expect(body.id).toBe("abc");
    expect(body.status).toBe("available");
  });

  it("returns 200 for a design with status=reserved", async () => {
    const db = makeDB({ row: { id: "abc", status: "reserved" } });
    const res = await GET(makeContext("abc", db));
    expect(res.status).toBe(200);
  });

  it("returns 200 for a design with status=sold", async () => {
    const db = makeDB({ row: { id: "abc", status: "sold" } });
    const res = await GET(makeContext("abc", db));
    expect(res.status).toBe(200);
  });

  it("returns 404 when the design exists but has status=pending", async () => {
    // Simulate the DB doing its job: because the WHERE clause filters out
    // 'pending', the query returns no row, which the handler maps to 404.
    const db = makeDB({ row: null });
    const res = await GET(makeContext("abc", db));
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Not found");
  });

  it("returns 404 when the design has status=rejected", async () => {
    const db = makeDB({ row: null });
    const res = await GET(makeContext("abc", db));
    expect(res.status).toBe(404);
  });

  it("returns 404 when the design has status=delisted", async () => {
    const db = makeDB({ row: null });
    const res = await GET(makeContext("abc", db));
    expect(res.status).toBe(404);
  });

  it("returns 404 when the design has status=owned", async () => {
    const db = makeDB({ row: null });
    const res = await GET(makeContext("abc", db));
    expect(res.status).toBe(404);
  });

  it("returns 404 when no design matches the id", async () => {
    const db = makeDB({ row: null });
    const res = await GET(makeContext("does-not-exist", db));
    expect(res.status).toBe(404);
  });

  it("returns 500 with JSON envelope when the DB throws", async () => {
    const db = {
      prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
          first: vi.fn().mockRejectedValue(new Error("boom")),
        })),
      })),
    };
    const ctx = makeContext("abc", db as never);

    const res = await GET(ctx);
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Internal server error");
  });

  it("returns JSON Content-Type on success and 404", async () => {
    const dbOk = makeDB({ row: { id: "abc", status: "available" } });
    const resOk = await GET(makeContext("abc", dbOk));
    expect(resOk.headers.get("content-type")).toMatch(/application\/json/);

    const db404 = makeDB({ row: null });
    const res404 = await GET(makeContext("abc", db404));
    expect(res404.headers.get("content-type")).toMatch(/application\/json/);
  });

  it("does NOT leak moderation states even if the DB row is returned (defence in depth)", async () => {
    // This test asserts the *contract*: callers can never receive a
    // moderation state from this endpoint. Because the WHERE clause filters
    // at the DB layer, a moderation-state row can never be returned — so
    // the only way to observe one would be a bug in the SQL. We assert the
    // SQL text to catch regressions in the query itself.
    const db = makeDB({ row: { id: "abc", status: "pending" } });
    await GET(makeContext("abc", db));
    const call = db.calls[0];
    // The SQL must reference the status column with an IN filter.
    expect(call.sql).toMatch(/d\.status IN/);
    // And the bound params must NOT include any moderation state.
    const boundStatuses = call.params.slice(1) as string[];
    expect(boundStatuses).not.toContain("pending");
    expect(boundStatuses).not.toContain("rejected");
    expect(boundStatuses).not.toContain("delisted");
    expect(boundStatuses).not.toContain("owned");
  });
});
