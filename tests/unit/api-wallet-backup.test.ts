/**
 * /api/wallet/backup route tests.
 *
 * Uses mocked Astro locals.user/locals.session and in-memory D1-like binding.
 */

import { describe, it, expect } from "vitest";
import { POST, GET } from "@/pages/api/wallet/backup";
import { encryptWithRecoveryPassword } from "@/lib/passkey/backup";

function createMockEnv() {
  const rows = new Map<string, Record<string, unknown>>();
  const db = {
    prepare: () => db,
    bind: function (...args: unknown[]) {
      this._bindArgs = args;
      return this;
    },
    run: function () {
      const [id, userId, address, encryptedBlob, recoverySalt, prfSalt, credentialId, createdAt, updatedAt] =
        this._bindArgs as [string, string, string, string, string, string | null, string | null, number, number];
      rows.set(id, { id, user_id: userId, address, encrypted_blob: encryptedBlob, recovery_salt: recoverySalt, prf_salt: prfSalt, credential_id: credentialId, created_at: createdAt, updated_at: updatedAt });
      return Promise.resolve({ success: true });
    },
    first: function <T>() {
      const [userId] = this._bindArgs as [string];
      for (const row of rows.values()) {
        if (row.user_id === userId) {
          return Promise.resolve(row as T);
        }
      }
      return Promise.resolve(null);
    },
    _bindArgs: [] as unknown[],
  };
  return { DB: db, rows };
}

type TestLocals = {
  runtime: { env: Env };
  user: { id: string; email: string } | null;
  session: Record<string, unknown> | null;
};

function createRequest(
  method: string,
  body?: unknown,
  user?: { id: string; email: string },
  existingEnv?: ReturnType<typeof createMockEnv>,
) {
  const url = new URL("https://example.com/api/wallet/backup");
  const env = existingEnv ?? createMockEnv();
  const locals: TestLocals = {
    runtime: { env: env as unknown as Env },
    user: user ?? null,
    session: user ? { id: "session_1", userId: user.id, token: "token", expiresAt: Date.now() + 3600_000, createdAt: Date.now(), updatedAt: Date.now() } : null,
  };
  return {
    request: new Request(url.toString(), {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }),
    locals: locals as unknown as Parameters<typeof POST>[0]["locals"],
    env,
  };
}

const user = { id: "user_1", email: "test@example.com" };
const address = "0x1234567890abcdef1234567890abcdef12345678";

describe("POST /api/wallet/backup", () => {
  it("stores backup when authenticated", async () => {
    const body = { address, encryptedBlob: "blob", recoverySalt: "salt" };
    const { request, locals, env } = createRequest("POST", body, user);

    const res = await POST({ request, locals, params: {} } as Parameters<typeof POST>[0]);

    expect(res.status).toBe(200);
    expect(env.rows.has("user_1")).toBe(true);
  });

  it("returns 401 when not authenticated", async () => {
    const body = { address, encryptedBlob: "blob", recoverySalt: "salt" };
    const { request, locals } = createRequest("POST", body);

    const res = await POST({ request, locals, params: {} } as Parameters<typeof POST>[0]);

    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid address", async () => {
    const body = { address: "not-an-address", encryptedBlob: "blob", recoverySalt: "salt" };
    const { request, locals } = createRequest("POST", body, user);

    const res = await POST({ request, locals, params: {} } as Parameters<typeof POST>[0]);

    expect(res.status).toBe(400);
  });
});

describe("GET /api/wallet/backup", () => {
  it("returns backup when authenticated and owner", async () => {
    const secret = { version: 1, address, daccPublicKey: "pk", encryptedPasswordSecretKey: "enc", prfSalt: "salt", credentialId: "cred" };
    const json = JSON.stringify(secret);
    const { encrypted, salt } = await encryptWithRecoveryPassword(json, "pw");
    const env = createMockEnv();
    const { request: postReq, locals: postLocals } = createRequest("POST", { address, encryptedBlob: encrypted, recoverySalt: salt }, user, env);
    await POST({ request: postReq, locals: postLocals, params: {} } as Parameters<typeof POST>[0]);

    const { request, locals } = createRequest("GET", undefined, user, env);
    const res = await GET({ request, locals, params: {} } as Parameters<typeof GET>[0]);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.encryptedBlob).toBe(encrypted);
    expect(body.recoverySalt).toBe(salt);
  });

  it("returns 401 when not authenticated", async () => {
    const { request, locals } = createRequest("GET");

    const res = await GET({ request, locals, params: {} } as Parameters<typeof GET>[0]);

    expect(res.status).toBe(401);
  });

  it("returns 404 when no backup exists", async () => {
    const { request, locals } = createRequest("GET", undefined, user);

    const res = await GET({ request, locals, params: {} } as Parameters<typeof GET>[0]);

    expect(res.status).toBe(404);
  });
});
