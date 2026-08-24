/**
 * Ticket #109 — H3 fix: Booking endpoint identity resolution.
 *
 * Verifies that the booking endpoint:
 *   1. Never uses contact field as client_id.
 *   2. Never trusts buyerWallet from body as identity.
 *   3. Uses authenticated user.id when available.
 *   4. Generates anon UUID for unauthenticated users.
 *   5. Stores contact/name as display metadata only.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/pages/api/bookings";

interface MockKv {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

function mockKv(): MockKv {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => { store.set(key, value); }),
    delete: vi.fn(async (key: string) => { store.delete(key); }),
  };
}

interface ConversationRow {
  id: string;
  client_id: string;
  artist_id: string;
  client_name: string | null;
  client_contact: string | null;
}

function createMockDb() {
  const conversations: ConversationRow[] = [];
  const bookingInquiries: any[] = [];
  const messages: any[] = [];

  return {
    conversations,
    bookingInquiries,
    messages,
    prepare(sql: string) {
      return {
        bind(...params: unknown[]) {
          return {
            async first<T>(): Promise<T | null> {
              if (sql.includes("SELECT id FROM conversations WHERE client_id = ?")) {
                const [clientId, artistId] = params as [string, string];
                const conv = conversations.find(
                  (c) => c.client_id === clientId && c.artist_id === artistId
                );
                return conv ? { id: conv.id } as T : null;
              }
              return null;
            },
            async run() {
              if (sql.includes("INSERT INTO booking_inquiries")) {
                bookingInquiries.push({ params });
              } else if (sql.includes("INSERT INTO conversations")) {
                const [id, clientId, artistId, designId, clientName, clientContact] = params as [
                  string, string, string, string | null, string, string
                ];
                conversations.push({
                  id,
                  client_id: clientId,
                  artist_id: artistId,
                  client_name: clientName,
                  client_contact: clientContact,
                });
              } else if (sql.includes("INSERT INTO messages")) {
                messages.push({ params });
              } else if (sql.includes("UPDATE conversations")) {
                // Update client_name and client_contact if provided
                const updateSql = sql;
                if (updateSql.includes("client_name = COALESCE")) {
                  const [lastMessage, lastMessageAt, clientName, clientContact, convId] = params as [
                    string, number, string, string, string
                  ];
                  const conv = conversations.find((c) => c.id === convId);
                  if (conv) {
                    conv.client_name = clientName || conv.client_name;
                    conv.client_contact = clientContact || conv.client_contact;
                  }
                }
              }
              return { success: true };
            },
          };
        },
      };
    },
  };
}

function buildContext(
  body: unknown,
  opts: {
    user?: { id: string } | null;
    cookie?: string;
  } = {}
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.cookie) headers.cookie = opts.cookie;

  return {
    request: new Request("http://localhost/api/bookings", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
    locals: {
      runtime: { env: { DB: createMockDb(), SESSION: mockKv() } },
      user: opts.user ?? null,
    },
  } as const;
}

const validBody = {
  artistId: "artist_1",
  name: "Test User",
  contact: "test@example.com",
  message: "I want a tattoo",
  bookingType: "custom" as const,
};

describe("POST /api/bookings — identity resolution (ticket #109)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uses authenticated user.id as client_id, not contact or buyerWallet", async () => {
    const walletAddress = "0x1234567890abcdef1234567890abcdef12345678";
    const ctx = buildContext(
      { ...validBody, buyerWallet: walletAddress },
      { user: { id: walletAddress } }
    );

    const res = await POST(ctx as never);
    expect(res.status).toBe(200);

    const db = (ctx.locals.runtime.env as any).DB;
    expect(db.conversations).toHaveLength(1);
    expect(db.conversations[0].client_id).toBe(walletAddress);
    expect(db.conversations[0].client_name).toBe("Test User");
    expect(db.conversations[0].client_contact).toBe("test@example.com");
  });

  it("generates anon UUID for unauthenticated users, not contact", async () => {
    const ctx = buildContext(validBody);

    const res = await POST(ctx as never);
    expect(res.status).toBe(200);

    const db = (ctx.locals.runtime.env as any).DB;
    expect(db.conversations).toHaveLength(1);
    // client_id should be a UUID, not the contact string
    expect(db.conversations[0].client_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(db.conversations[0].client_id).not.toBe("test@example.com");
    expect(db.conversations[0].client_name).toBe("Test User");
    expect(db.conversations[0].client_contact).toBe("test@example.com");
  });

  it("does not trust buyerWallet from body as identity", async () => {
    const fakeWallet = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
    const ctx = buildContext({ ...validBody, buyerWallet: fakeWallet });

    const res = await POST(ctx as never);
    expect(res.status).toBe(200);

    const db = (ctx.locals.runtime.env as any).DB;
    expect(db.conversations).toHaveLength(1);
    // Should be a generated UUID, not the fake wallet
    expect(db.conversations[0].client_id).not.toBe(fakeWallet);
    expect(db.conversations[0].client_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it("reuses existing anon_client_id cookie", async () => {
    const existingUuid = "550e8400-e29b-41d4-a716-446655440000";
    const ctx = buildContext(validBody, { cookie: `anon_client_id=${existingUuid}` });

    const res = await POST(ctx as never);
    expect(res.status).toBe(200);

    const db = (ctx.locals.runtime.env as any).DB;
    expect(db.conversations).toHaveLength(1);
    expect(db.conversations[0].client_id).toBe(existingUuid);
  });

  it("sets anon_client_id cookie for new anonymous users", async () => {
    const ctx = buildContext(validBody);

    const res = await POST(ctx as never);
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("anon_client_id=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/");
  });

  it("does not set cookie when user is authenticated", async () => {
    const ctx = buildContext(validBody, { user: { id: "0x1234" } });

    const res = await POST(ctx as never);
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeNull();
  });

  it("prevents thread merging: different contacts create separate conversations", async () => {
    // First booking with contact "alice@example.com"
    const ctx1 = buildContext({ ...validBody, contact: "alice@example.com" });
    await POST(ctx1 as never);
    const db1 = (ctx1.locals.runtime.env as any).DB;
    const clientId1 = db1.conversations[0].client_id;

    // Second booking with contact "bob@example.com" (no cookie reuse)
    const ctx2 = buildContext({ ...validBody, contact: "bob@example.com" });
    await POST(ctx2 as never);
    const db2 = (ctx2.locals.runtime.env as any).DB;
    const clientId2 = db2.conversations[0].client_id;

    // Different anon UUIDs, not merged by contact
    expect(clientId1).not.toBe(clientId2);
    expect(clientId1).not.toBe("alice@example.com");
    expect(clientId2).not.toBe("bob@example.com");
  });
});
