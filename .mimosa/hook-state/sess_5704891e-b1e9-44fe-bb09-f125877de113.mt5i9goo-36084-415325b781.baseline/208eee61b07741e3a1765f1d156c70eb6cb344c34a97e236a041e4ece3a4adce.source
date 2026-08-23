/**
 * GET /api/designs — status filter + pagination (TDD).
 *
 * H1 fix: the public listing must never expose moderation states
 * ('pending', 'rejected', 'delisted') or the post-mint 'owned' state.
 * It must also paginate with a bounded limit and return a total count.
 *
 * Seams under test:
 *   1. Default request restricts SQL to public statuses.
 *   2. ?status= narrows the filter within the public allowlist.
 *   3. ?status= outside the public allowlist returns 400.
 *   4. limit is clamped to [1, 100]; out-of-range returns 400.
 *   5. offset must be a non-negative integer; invalid returns 400.
 *   6. Response envelope is { data, total, limit, offset }.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/pages/api/designs/index";

interface PreparedCall {
  sql: string;
  params: (string | number)[];
}

function makeDB(opts: {
  count?: number;
  rows?: unknown[];
} = {}) {
  const calls: PreparedCall[] = [];
  const count = opts.count ?? 0;
  const rows = opts.rows ?? [];

  const prepare = vi.fn((sql: string) => {
    const bind = vi.fn((...params: (string | number)[]) => {
      calls.push({ sql, params });
      return {
        all: vi.fn().mockResolvedValue({ results: sql.includes("COUNT") ? [] : rows }),
        first: vi.fn().mockResolvedValue(sql.includes("COUNT") ? { total: count } : null),
        run: vi.fn().mockResolvedValue({ success: true }),
      };
    });
    return { bind };
  });

  return { prepare, calls };
}

function makeContext(url: string, db: ReturnType<typeof makeDB>) {
  return {
    request: new Request(url, { method: "GET" }),
    locals: {
      runtime: {
        env: { DB: { prepare: db.prepare } },
      },
    },
  } as never;
}

describe("GET /api/designs — public status filter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("restricts the WHERE clause to public statuses by default", async () => {
    const db = makeDB({ count: 2, rows: [{ id: "a" }, { id: "b" }] });
    const ctx = makeContext("http://localhost/api/designs", db);

    const res = await GET(ctx);
    expect(res.status).toBe(200);

    // Both the COUNT and the data query must filter to the public allowlist.
    const dataCall = db.calls.find((c) => !c.sql.includes("COUNT"));
    const countCall = db.calls.find((c) => c.sql.includes("COUNT"));
    expect(dataCall).toBeDefined();
    expect(countCall).toBeDefined();
    expect(dataCall!.sql).toMatch(/WHERE d\.status IN \(\?,\?,\?\)/);
    expect(countCall!.sql).toMatch(/WHERE d\.status IN \(\?,\?,\?\)/);
    // The bound params must be exactly the three public statuses (no pending/rejected/delisted/owned).
    expect(dataCall!.params.slice(0, 3)).toEqual(["available", "reserved", "sold"]);
    expect(countCall!.params).toEqual(["available", "reserved", "sold"]);
  });

  it("returns a paginated envelope with total, limit, offset", async () => {
    const db = makeDB({ count: 7, rows: [{ id: "a" }] });
    const ctx = makeContext("http://localhost/api/designs?limit=1&offset=2", db);

    const res = await GET(ctx);
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      data: unknown[];
      total: number;
      limit: number;
      offset: number;
    };
    expect(body.total).toBe(7);
    expect(body.limit).toBe(1);
    expect(body.offset).toBe(2);
    expect(Array.isArray(body.data)).toBe(true);

    // LIMIT and OFFSET must propagate to the SQL binding.
    const dataCall = db.calls.find((c) => !c.sql.includes("COUNT"));
    // Params order: ...statuses, limit, offset
    const tail = dataCall!.params.slice(-2);
    expect(tail).toEqual([1, 2]);
  });

  it("narrows filter when ?status=available is provided", async () => {
    const db = makeDB({ count: 0, rows: [] });
    const ctx = makeContext("http://localhost/api/designs?status=available", db);

    const res = await GET(ctx);
    expect(res.status).toBe(200);

    const dataCall = db.calls.find((c) => !c.sql.includes("COUNT"));
    expect(dataCall!.sql).toMatch(/WHERE d\.status IN \(\?\)/);
    expect(dataCall!.params).toEqual(["available", 50, 0]);
  });

  it("rejects ?status=pending with 400 (moderation state)", async () => {
    const db = makeDB();
    const ctx = makeContext("http://localhost/api/designs?status=pending", db);

    const res = await GET(ctx);
    expect(res.status).toBe(400);

    const body = (await res.json()) as { error: string; issues?: unknown[] };
    expect(body.error).toBe("Invalid query");
    // No DB calls should have been made for an invalid request.
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it("rejects ?status=owned with 400 (post-mint state, not public)", async () => {
    const db = makeDB();
    const ctx = makeContext("http://localhost/api/designs?status=owned", db);

    const res = await GET(ctx);
    expect(res.status).toBe(400);
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it("rejects ?status=delisted with 400", async () => {
    const db = makeDB();
    const ctx = makeContext("http://localhost/api/designs?status=delisted", db);

    const res = await GET(ctx);
    expect(res.status).toBe(400);
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it("rejects limit > 100 with 400", async () => {
    const db = makeDB();
    const ctx = makeContext("http://localhost/api/designs?limit=200", db);

    const res = await GET(ctx);
    expect(res.status).toBe(400);
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it("rejects negative limit with 400", async () => {
    const db = makeDB();
    const ctx = makeContext("http://localhost/api/designs?limit=-1", db);

    const res = await GET(ctx);
    expect(res.status).toBe(400);
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it("rejects non-numeric offset with 400", async () => {
    const db = makeDB();
    const ctx = makeContext("http://localhost/api/designs?offset=abc", db);

    const res = await GET(ctx);
    expect(res.status).toBe(400);
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it("defaults limit to 50 and offset to 0 when omitted", async () => {
    const db = makeDB({ count: 0, rows: [] });
    const ctx = makeContext("http://localhost/api/designs", db);

    const res = await GET(ctx);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { limit: number; offset: number };
    expect(body.limit).toBe(50);
    expect(body.offset).toBe(0);

    const dataCall = db.calls.find((c) => !c.sql.includes("COUNT"));
    const tail = dataCall!.params.slice(-2);
    expect(tail).toEqual([50, 0]);
  });

  it("returns JSON Content-Type on success and error", async () => {
    const dbOk = makeDB({ count: 0, rows: [] });
    const resOk = await GET(makeContext("http://localhost/api/designs", dbOk));
    expect(resOk.headers.get("content-type")).toMatch(/application\/json/);

    const dbBad = makeDB();
    const resBad = await GET(
      makeContext("http://localhost/api/designs?status=pending", dbBad)
    );
    expect(resBad.headers.get("content-type")).toMatch(/application\/json/);
  });

  it("JOINs artists and filters out soft-deleted and test- artists (H6)", async () => {
    const db = makeDB({ count: 1, rows: [{ id: "a" }] });
    const ctx = makeContext("http://localhost/api/designs", db);

    const res = await GET(ctx);
    expect(res.status).toBe(200);

    // Both queries must JOIN artists and apply the H6 filter.
    const dataCall = db.calls.find((c) => !c.sql.includes("COUNT"));
    const countCall = db.calls.find((c) => c.sql.includes("COUNT"));

    // The FROM clause must JOIN artists on artist_id.
    expect(dataCall!.sql).toMatch(
      /FROM designs d JOIN artists a ON a\.id = d\.artist_id/
    );
    expect(countCall!.sql).toMatch(
      /FROM designs d JOIN artists a ON a\.id = d\.artist_id/
    );

    // Both queries must exclude soft-deleted artists.
    expect(dataCall!.sql).toMatch(/a\.deleted_at IS NULL/);
    expect(countCall!.sql).toMatch(/a\.deleted_at IS NULL/);

    // Both queries must exclude test- artists.
    expect(dataCall!.sql).toMatch(/a\.name NOT LIKE 'test-%'/);
    expect(countCall!.sql).toMatch(/a\.name NOT LIKE 'test-%'/);

    // The data query must scope its SELECT to design columns (d.*) so the
    // JOIN does not leak artist columns into the public response.
    expect(dataCall!.sql).toMatch(/SELECT d\.\*/);
  });

  it("returns 500 with JSON envelope when the DB throws", async () => {
    const db = {
      prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
          first: vi.fn().mockRejectedValue(new Error("boom")),
          all: vi.fn().mockRejectedValue(new Error("boom")),
        })),
      })),
    };
    const ctx = makeContext("http://localhost/api/designs", db as never);

    const res = await GET(ctx);
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Internal server error");
  });
});
