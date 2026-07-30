/**
 * Artist wallet signature login — unit tests (TDD red→green).
 *
 * Tests the challenge endpoint and login handler with mocked KV + D1,
 * using a real viem wallet to generate signatures.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { GET as challengeGet } from "@/pages/api/auth/challenge";
import { POST as loginPost } from "@/pages/api/auth/artist-login";

interface MockKv {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
}

function mockKv(): MockKv {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string, _opts?: unknown) => { store.set(key, value); }),
    delete: vi.fn(async (key: string) => { store.delete(key); }),
    list: vi.fn(),
  };
}

interface MockDb {
  prepare: ReturnType<typeof vi.fn>;
}

function mockDb(artist?: { id: string; name: string; wallet_address: string | null }) {
  return {
    prepare: vi.fn((sql: string) => ({
      bind: vi.fn((...params: unknown[]) => ({
        first: vi.fn(async () => artist ?? null),
        run: vi.fn(async () => ({ results: [] })),
        all: vi.fn(async () => ({ results: [] })),
      })),
    })),
  };
}

function buildLoginContext(body: unknown, env: { SESSION: MockKv; DB: MockDb }) {
  return {
    request: new Request("http://localhost/api/auth/artist-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    locals: { runtime: { env } },
  } as const;
}

describe("GET /api/auth/challenge", () => {
  it("returns a message and nonce and stores it in KV", async () => {
    const kv = mockKv();
    const ctx = {
      request: new Request("http://localhost/api/auth/challenge"),
      locals: { runtime: { env: { SESSION: kv } } },
    } as const;

    const res = await challengeGet(ctx as never);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { message: string; nonce: string };
    expect(typeof body.message).toBe("string");
    expect(body.message).toMatch(/^inknoir-artist-login-/);
    expect(typeof body.nonce).toBe("string");

    expect(kv.put).toHaveBeenCalledOnce();
    const [key, value] = kv.put.mock.calls[0];
    expect(key).toBe(`challenge:${body.nonce}`);
    expect(value).toBe(body.message);
  });
});

describe("POST /api/auth/artist-login", () => {
  let kv: MockKv;
  let db: MockDb;
  let env: { SESSION: MockKv; DB: MockDb };

  beforeEach(() => {
    kv = mockKv();
    db = mockDb();
    env = { SESSION: kv, DB: db };
  });

  async function getChallenge(): Promise<{ message: string; nonce: string }> {
    const challengeCtx = {
      request: new Request("http://localhost/api/auth/challenge"),
      locals: { runtime: { env } },
    } as const;
    const res = await challengeGet(challengeCtx as never);
    return res.json() as Promise<{ message: string; nonce: string }>;
  }

  it("returns 200 + cookie for a valid signature and artist wallet", async () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const artist = { id: "artist-1", name: "Alice", wallet_address: account.address.toLowerCase() };
    db = mockDb(artist);
    env.DB = db;

    const { message, nonce } = await getChallenge();
    const signature = await account.signMessage({ message });

    const res = await loginPost(buildLoginContext({ address: account.address, signature, nonce }, env) as never);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { ok: boolean; artistId: string };
    expect(body.ok).toBe(true);
    expect(body.artistId).toBe(artist.id);

    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/artist_token=[^;]+/);

    expect(kv.delete).toHaveBeenCalledWith(`challenge:${nonce}`);
    expect(kv.put).toHaveBeenCalledWith(expect.stringMatching(/^artist:/), expect.any(String), expect.objectContaining({ expirationTtl: 28800 }));
  });

  it("returns 400 when parameters are missing", async () => {
    const cases = [
      {},
      { address: "0x0000000000000000000000000000000000000000", signature: "0x00" },
      { address: "0x0000000000000000000000000000000000000000", nonce: "n" },
      { signature: "0x00", nonce: "n" },
    ];

    for (const body of cases) {
      const res = await loginPost(buildLoginContext(body, env) as never);
      expect(res.status).toBe(400);
      const json = (await res.json()) as { error: string };
      expect(json.error).toMatch(/missing/i);
    }
  });

  it("returns 400 for malformed JSON", async () => {
    const ctx = {
      request: new Request("http://localhost/api/auth/artist-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      }),
      locals: { runtime: { env } },
    } as const;
    const res = await loginPost(ctx as never);
    expect(res.status).toBe(400);
  });

  it("returns 401 for an invalid or expired nonce", async () => {
    const res = await loginPost(buildLoginContext({
      address: "0x0000000000000000000000000000000000000000",
      signature: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b",
      nonce: "does-not-exist",
    }, env) as never);
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/invalid or expired nonce/i);
  });

  it("returns 401 for a signature that does not verify", async () => {
    const { nonce } = await getChallenge();
    const res = await loginPost(buildLoginContext({
      address: "0x0000000000000000000000000000000000000000",
      signature: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b",
      nonce,
    }, env) as never);
    expect(res.status).toBe(401);
  });

  it("returns 403 when wallet is not linked to an artist", async () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const { message, nonce } = await getChallenge();
    const signature = await account.signMessage({ message });

    const res = await loginPost(buildLoginContext({ address: account.address, signature, nonce }, env) as never);
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/not linked/i);
  });

  it("deletes the nonce even when verification fails", async () => {
    const { nonce } = await getChallenge();
    await loginPost(buildLoginContext({
      address: "0x0000000000000000000000000000000000000000",
      signature: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b",
      nonce,
    }, env) as never);
    expect(kv.delete).toHaveBeenCalledWith(`challenge:${nonce}`);
  });
});
