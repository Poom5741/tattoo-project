/**
 * Admin update-artist API — unit tests.
 *
 * Tests the POST /api/admin/update-artist handler for validation,
 * authentication, and database updates.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { POST } from "@/pages/api/admin/update-artist";

interface MockDbResult {
  results: unknown[];
  success: boolean;
  meta: Record<string, unknown>;
}

interface MockDbStatement {
  bind: ReturnType<typeof vi.fn>;
  first: ReturnType<typeof vi.fn>;
  run: ReturnType<typeof vi.fn>;
  all: ReturnType<typeof vi.fn>;
}

function mockDb(existingArtist: Record<string, unknown> | null = null): {
  prepare: ReturnType<typeof vi.fn>;
  _updatedData: Record<string, unknown> | null;
} {
  const state = { _updatedData: null as Record<string, unknown> | null };

  const statement: MockDbStatement = {
    bind: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(existingArtist),
    run: vi.fn().mockImplementation(function (this: MockDbStatement) {
      // Capture the bound values to verify what was updated
      state._updatedData = {};
      const callArgs = this.bind.mock.calls;
      if (callArgs.length > 0) {
        const args = callArgs[callArgs.length - 1];
        state._updatedData = { args };
      }
      return Promise.resolve({ success: true });
    }),
    all: vi.fn().mockResolvedValue({ results: [], success: true }),
  };

  return {
    prepare: vi.fn().mockReturnValue(statement),
    _updatedData: state._updatedData,
  };
}

function mockKv(): { get: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> } {
  return {
    get: vi.fn().mockResolvedValue("1"), // Admin session exists
    put: vi.fn(),
  };
}

function mockContext(body?: BodyInit, db?: ReturnType<typeof mockDb>) {
  return {
    request: new Request("http://localhost/api/admin/update-artist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: "admin_token=test-session",
      },
      body,
    }),
    locals: {
      runtime: {
        env: {
          DB: db?.prepare ? { prepare: db.prepare } : undefined,
          SESSION: mockKv(),
        },
      },
    },
  } as const;
}

describe("POST /api/admin/update-artist", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 500 if database not available", async () => {
    const ctx = mockContext(
      JSON.stringify({ artistId: "test-artist", name: "New Name" }),
      { prepare: vi.fn(), _updatedData: null }
    );
    // Override to no DB
    const noDbCtx = {
      ...ctx,
      locals: {
        runtime: {
          env: { SESSION: mockKv() },
        },
      },
    };
    const res = await POST(noDbCtx as never);
    expect(res.status).toBe(500);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("Database not available");
  });

  it("returns 401 if not authenticated", async () => {
    const db = mockDb(null);
    const ctx = {
      request: new Request("http://localhost/api/admin/update-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId: "test-artist", name: "New Name" }),
      }),
      locals: {
        runtime: {
          env: {
            DB: { prepare: db.prepare },
            SESSION: { get: vi.fn().mockResolvedValue(null), put: vi.fn() },
          },
        },
      },
    };
    const res = await POST(ctx as never);
    expect(res.status).toBe(401);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 for invalid JSON", async () => {
    const db = mockDb(null);
    const ctx = mockContext("not valid json", db);
    const res = await POST(ctx as never);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("Invalid JSON");
  });

  it("returns 400 for missing artistId", async () => {
    const db = mockDb(null);
    const ctx = mockContext(JSON.stringify({ name: "New Name" }), db);
    const res = await POST(ctx as never);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBeDefined();
  });

  it("returns 404 if artist not found", async () => {
    const db = mockDb(null);
    const ctx = mockContext(
      JSON.stringify({ artistId: "nonexistent", name: "New Name" }),
      db
    );
    const res = await POST(ctx as never);
    expect(res.status).toBe(404);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("Artist not found");
  });

  it("returns 400 if artist is deleted", async () => {
    const db = mockDb({ id: "test-artist", name: "Test", deleted_at: 1234567890 });
    const ctx = mockContext(
      JSON.stringify({ artistId: "test-artist", name: "New Name" }),
      db
    );
    const res = await POST(ctx as never);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("Cannot edit deleted artist");
  });

  it("returns 200 and updates artist name", async () => {
    const db = mockDb({ id: "test-artist", name: "Old Name", deleted_at: null });
    const ctx = mockContext(
      JSON.stringify({ artistId: "test-artist", name: "New Name" }),
      db
    );
    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(db.prepare).toHaveBeenCalled();
  });

  it("returns 200 and updates wallet address", async () => {
    const db = mockDb({ id: "test-artist", name: "Test Artist", deleted_at: null });
    const ctx = mockContext(
      JSON.stringify({
        artistId: "test-artist",
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      }),
      db
    );
    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.ok).toBe(true);
  });

  it("returns 400 for invalid wallet address format", async () => {
    const db = mockDb({ id: "test-artist", name: "Test Artist", deleted_at: null });
    const ctx = mockContext(
      JSON.stringify({
        artistId: "test-artist",
        walletAddress: "invalid-address",
      }),
      db
    );
    const res = await POST(ctx as never);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toContain("Must be a 0x Ethereum address");
  });

  it("returns 400 for empty update (no fields)", async () => {
    const db = mockDb({ id: "test-artist", name: "Test Artist", deleted_at: null });
    const ctx = mockContext(
      JSON.stringify({ artistId: "test-artist" }),
      db
    );
    const res = await POST(ctx as never);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("No fields to update");
  });

  it("returns 400 for name exceeding max length", async () => {
    const db = mockDb({ id: "test-artist", name: "Test Artist", deleted_at: null });
    const ctx = mockContext(
      JSON.stringify({ artistId: "test-artist", name: "a".repeat(101) }),
      db
    );
    const res = await POST(ctx as never);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBeDefined();
  });

  it("returns 500 on database error", async () => {
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue({ id: "test-artist", name: "Test", deleted_at: null }),
        run: vi.fn().mockRejectedValue(new Error("DB error")),
      }),
    };
    const ctx = mockContext(
      JSON.stringify({ artistId: "test-artist", name: "New Name" }),
      db as never
    );
    const res = await POST(ctx as never);
    expect(res.status).toBe(500);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("Failed to update artist");
  });
});
