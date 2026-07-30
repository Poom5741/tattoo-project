/**
 * /api/chat/conversations route tests.
 *
 * Uses mocked Astro locals.user/locals.session, artist/admin KV sessions,
 * and an in-memory D1-like binding.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listGet } from "@/pages/api/chat/conversations/index";
import { GET as singleGet } from "@/pages/api/chat/conversations/[id]";

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

interface ArtistRow {
  id: string;
  name: string;
  handle: string | null;
}

interface ConversationRow {
  id: string;
  client_id: string;
  artist_id: string;
  design_id: string | null;
  last_message: string | null;
  last_message_at: number | null;
  unread: number;
  status: string;
  created_at: number;
}

function createMockDb(artists: ArtistRow[] = [], conversations: ConversationRow[] = []) {
  return {
    artists,
    conversations,
    prepare(sql: string) {
      const self = this as { artists: ArtistRow[]; conversations: ConversationRow[] };
      return {
        bind(...params: unknown[]) {
          return {
            async all<T>() {
              let rows = self.conversations;
              if (sql.includes("WHERE client_id = ?")) {
                rows = rows.filter((r) => r.client_id === params[0]);
              } else if (sql.includes("WHERE artist_id = ?")) {
                rows = rows.filter((r) => r.artist_id === params[0]);
              } else if (sql.includes("artist_id = ?")) {
                rows = rows.filter((r) => r.artist_id === params[0]);
              }
              return { results: rows.map((r) => ({ ...r })) as T[] };
            },
            async first<T>() {
              const id = params[0] as string;
              const conv = self.conversations.find((r) => r.id === id);
              if (!conv) return null;
              const artist = self.artists.find((a) => a.id === conv.artist_id);
              return { ...conv, artist_name: artist?.name ?? null, artist_handle: artist?.handle ?? null } as T;
            },
            async run() {
              return { results: [] };
            },
          };
        },
      };
    },
  };
}

function buildListContext(
  env: { SESSION: MockKv; DB: ReturnType<typeof createMockDb> },
  opts?: {
    user?: { id: string; email: string };
    artistToken?: string;
    adminToken?: string;
    artistId?: string;
  }
) {
  const cookies: string[] = [];
  if (opts?.artistToken) cookies.push(`artist_token=${opts.artistToken}`);
  if (opts?.adminToken) cookies.push(`admin_token=${opts.adminToken}`);
  const headers: Record<string, string> = {};
  if (cookies.length) headers.cookie = cookies.join("; ");
  return {
    request: new Request(
      opts?.artistId
        ? `http://localhost/api/chat/conversations?artistId=${opts.artistId}`
        : "http://localhost/api/chat/conversations",
      { headers }
    ),
    locals: {
      runtime: { env },
      user: opts?.user ?? null,
      session: opts?.user ? { id: "session_1", userId: opts.user.id } : null,
    },
  } as const;
}

function buildSingleContext(
  id: string,
  env: { SESSION: MockKv; DB: ReturnType<typeof createMockDb> },
  opts?: {
    user?: { id: string; email: string };
    artistToken?: string;
    adminToken?: string;
  }
) {
  const cookies: string[] = [];
  if (opts?.artistToken) cookies.push(`artist_token=${opts.artistToken}`);
  if (opts?.adminToken) cookies.push(`admin_token=${opts.adminToken}`);
  const headers: Record<string, string> = {};
  if (cookies.length) headers.cookie = cookies.join("; ");
  return {
    request: new Request(`http://localhost/api/chat/conversations/${id}`, { headers }),
    locals: {
      runtime: { env },
      user: opts?.user ?? null,
      session: opts?.user ? { id: "session_1", userId: opts.user.id } : null,
    },
    params: { id },
  } as const;
}

describe("GET /api/chat/conversations", () => {
  it("returns 401 when no authentication is present", async () => {
    const env = { SESSION: mockKv(), DB: createMockDb() };
    const ctx = buildListContext(env);
    const res = await listGet(ctx as never);
    expect(res.status).toBe(401);
  });

  it("returns client-scoped conversations", async () => {
    const artists = [{ id: "artist_1", name: "Alice", handle: "alice" }];
    const conversations = [
      {
        id: "conv_1",
        client_id: "client_1",
        artist_id: "artist_1",
        design_id: null,
        last_message: "hi",
        last_message_at: 1000,
        unread: 0,
        status: "active",
        created_at: 500,
      },
      {
        id: "conv_2",
        client_id: "other_client",
        artist_id: "artist_1",
        design_id: null,
        last_message: "hello",
        last_message_at: 2000,
        unread: 1,
        status: "active",
        created_at: 600,
      },
    ];
    const env = { SESSION: mockKv(), DB: createMockDb(artists, conversations) };
    const ctx = buildListContext(env, { user: { id: "client_1", email: "c@example.com" } });
    const res = await listGet(ctx as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { conversations: ConversationRow[] };
    expect(body.conversations).toHaveLength(1);
    expect(body.conversations[0].id).toBe("conv_1");
  });

  it("returns artist-scoped conversations from session", async () => {
    const artists = [{ id: "artist_1", name: "Alice", handle: "alice" }];
    const conversations = [
      {
        id: "conv_1",
        client_id: "client_1",
        artist_id: "artist_1",
        design_id: null,
        last_message: "hi",
        last_message_at: 1000,
        unread: 0,
        status: "active",
        created_at: 500,
      },
      {
        id: "conv_2",
        client_id: "client_1",
        artist_id: "artist_2",
        design_id: null,
        last_message: "hello",
        last_message_at: 2000,
        unread: 1,
        status: "active",
        created_at: 600,
      },
    ];
    const kv = mockKv();
    const token = "artist-token-1";
    await kv.put(`artist:${token}`, JSON.stringify({ artistId: "artist_1", walletAddress: "0xabc", name: "Alice" }));
    const env = { SESSION: kv, DB: createMockDb(artists, conversations) };
    const ctx = buildListContext(env, { artistToken: token });
    const res = await listGet(ctx as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { conversations: ConversationRow[] };
    expect(body.conversations).toHaveLength(1);
    expect(body.conversations[0].id).toBe("conv_1");
  });

  it("returns all conversations for admin and supports artistId filter", async () => {
    const artists = [
      { id: "artist_1", name: "Alice", handle: "alice" },
      { id: "artist_2", name: "Bob", handle: "bob" },
    ];
    const conversations = [
      {
        id: "conv_1",
        client_id: "client_1",
        artist_id: "artist_1",
        design_id: null,
        last_message: "hi",
        last_message_at: 1000,
        unread: 0,
        status: "active",
        created_at: 500,
      },
      {
        id: "conv_2",
        client_id: "client_1",
        artist_id: "artist_2",
        design_id: null,
        last_message: "hello",
        last_message_at: 2000,
        unread: 1,
        status: "active",
        created_at: 600,
      },
    ];
    const kv = mockKv();
    const token = "admin-token-1";
    await kv.put(`admin:${token}`, "1");
    const env = { SESSION: kv, DB: createMockDb(artists, conversations) };
    const ctx = buildListContext(env, { adminToken: token, artistId: "artist_2" });
    const res = await listGet(ctx as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { conversations: ConversationRow[] };
    expect(body.conversations).toHaveLength(1);
    expect(body.conversations[0].id).toBe("conv_2");
  });
});

describe("GET /api/chat/conversations/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    const env = { SESSION: mockKv(), DB: createMockDb() };
    const ctx = buildSingleContext("conv_1", env);
    const res = await singleGet(ctx as never);
    expect(res.status).toBe(401);
  });

  it("returns 404 when conversation does not exist", async () => {
    const env = { SESSION: mockKv(), DB: createMockDb() };
    const ctx = buildSingleContext("missing", env, { user: { id: "client_1", email: "c@example.com" } });
    const res = await singleGet(ctx as never);
    expect(res.status).toBe(404);
  });

  it("returns 403 for non-participant user", async () => {
    const artists = [{ id: "artist_1", name: "Alice", handle: "alice" }];
    const conversations = [
      {
        id: "conv_1",
        client_id: "client_1",
        artist_id: "artist_1",
        design_id: null,
        last_message: "hi",
        last_message_at: 1000,
        unread: 0,
        status: "active",
        created_at: 500,
      },
    ];
    const env = { SESSION: mockKv(), DB: createMockDb(artists, conversations) };
    const ctx = buildSingleContext("conv_1", env, { user: { id: "other_client", email: "x@example.com" } });
    const res = await singleGet(ctx as never);
    expect(res.status).toBe(403);
  });

  it("returns conversation with artist info for participant", async () => {
    const artists = [{ id: "artist_1", name: "Alice", handle: "alice" }];
    const conversations = [
      {
        id: "conv_1",
        client_id: "client_1",
        artist_id: "artist_1",
        design_id: null,
        last_message: "hi",
        last_message_at: 1000,
        unread: 0,
        status: "active",
        created_at: 500,
      },
    ];
    const env = { SESSION: mockKv(), DB: createMockDb(artists, conversations) };
    const ctx = buildSingleContext("conv_1", env, { user: { id: "client_1", email: "c@example.com" } });
    const res = await singleGet(ctx as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      conversation: ConversationRow & { artist_name: string; artist_handle: string };
    };
    expect(body.conversation.id).toBe("conv_1");
    expect(body.conversation.artist_name).toBe("Alice");
    expect(body.conversation.artist_handle).toBe("alice");
  });
});
