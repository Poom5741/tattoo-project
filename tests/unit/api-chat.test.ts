/**
 * /api/chat/send and /api/chat/messages unit tests.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as sendPost } from "@/pages/api/chat/send";
import { GET as messagesGet } from "@/pages/api/chat/messages/[conversationId]";
import type { ChatMessage, Conversation } from "@/lib/chat/schema";

interface MockRow {
  sql?: string;
  params?: unknown[];
  result?: unknown;
}

function mockDb(seed?: {
  conversations?: Conversation[];
  messages?: ChatMessage[];
}) {
  const conversations = new Map<string, Conversation>(
    seed?.conversations?.map((c) => [c.id, { ...c }])
  );
  const messages = new Map<string, ChatMessage>(
    seed?.messages?.map((m) => [m.id, { ...m }])
  );
  const statements: MockRow[] = [];

  function capture(sql: string, params: unknown[]) {
    statements.push({ sql, params });
  }

  function prepare(sql: string) {
    return {
      bind: function (...params: unknown[]) {
        return {
          first: async <T>() => {
            capture(sql, params);
            const [id] = params as [string];
            if (sql.match(/FROM conversations/i)) {
              const row = conversations.get(id as string);
              if (!row) return null;
              return {
                id: row.id,
                client_id: row.clientId,
                artist_id: row.artistId,
                design_id: row.designId ?? null,
                last_message: row.lastMessage ?? null,
                last_message_at: row.lastMessageAt ?? null,
                unread: row.unread,
                status: row.status,
                created_at: row.createdAt,
              } as T;
            }
            return null as T;
          },
          run: async () => {
            capture(sql, params);
            if (sql.match(/INSERT INTO messages/i)) {
              const [
                id,
                conversationId,
                senderId,
                senderRole,
                text,
                _bookingId,
                _bookingAction,
                flagged,
                flagReason,
                createdAt,
              ] = params as [string, string, string, string, string, null, null, number, string | null, number];
              messages.set(id, {
                id,
                conversationId,
                senderId,
                senderRole: senderRole as ChatMessage["senderRole"],
                text,
                flagged: flagged === 1,
                flagReason: flagReason ?? undefined,
                createdAt,
              });
              return { success: true };
            }
            if (sql.match(/UPDATE conversations/i)) {
              if (sql.match(/unread\s*=\s*0/i)) {
                const [id] = params as [string];
                const c = conversations.get(id);
                if (c) c.unread = 0;
                return { success: true };
              }
              const [lastMessage, lastMessageAt, unreadDelta, id] = params as [
                string,
                number,
                number,
                string,
              ];
              const c = conversations.get(id);
              if (c) {
                c.lastMessage = lastMessage;
                c.lastMessageAt = lastMessageAt;
                c.unread += unreadDelta;
              }
              return { success: true };
            }
            return { success: true };
          },
          all: async <T>() => {
            capture(sql, params);
            if (sql.match(/FROM messages/i)) {
              const since = sql.match(/created_at\s*>\s*\?/i) ? (params[1] as number) : undefined;
              const rows = Array.from(messages.values())
                .filter((m) => m.conversationId === (params[0] as string) && (since === undefined || m.createdAt > since))
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((m) => ({
                  id: m.id,
                  conversation_id: m.conversationId,
                  sender_id: m.senderId,
                  sender_role: m.senderRole,
                  text: m.text,
                  booking_id: m.bookingId ?? null,
                  booking_action: m.bookingAction ?? null,
                  flagged: m.flagged ? 1 : 0,
                  flag_reason: m.flagReason ?? null,
                  created_at: m.createdAt,
                }));
              return { results: rows as T[] };
            }
            return { results: [] as T[] };
          },
        };
      },
    };
  }

  return {
    DB: { prepare },
    conversations,
    messages,
    statements,
  };
}

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
    put: vi.fn(async (key: string, value: string) => { store.set(key, value); }),
    delete: vi.fn(),
    list: vi.fn(),
  };
}

type TestLocals = {
  runtime: { env: Env };
  user: { id: string } | null;
  session: Record<string, unknown> | null;
};

function buildSendContext(
  body: unknown,
  locals: TestLocals,
  cookie = ""
) {
  return {
    request: new Request("http://localhost/api/chat/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    }),
    locals: locals as unknown as Parameters<typeof sendPost>[0]["locals"],
    params: {},
  } as const;
}

function buildMessagesContext(
  conversationId: string,
  locals: TestLocals,
  opts: { cookie?: string; since?: number; limit?: number; offset?: number } = {}
) {
  const url = new URL(`http://localhost/api/chat/messages/${conversationId}`);
  if (opts.since !== undefined) url.searchParams.set("since", String(opts.since));
  if (opts.limit !== undefined) url.searchParams.set("limit", String(opts.limit));
  if (opts.offset !== undefined) url.searchParams.set("offset", String(opts.offset));

  return {
    request: new Request(url.toString(), {
      headers: opts.cookie ? { Cookie: opts.cookie } : undefined,
    }),
    locals: locals as unknown as Parameters<typeof messagesGet>[0]["locals"],
    params: { conversationId },
  } as const;
}

const baseConversation: Conversation = {
  id: "conv_1",
  clientId: "user_1",
  artistId: "artist_1",
  designId: null,
  lastMessage: null,
  lastMessageAt: null,
  unread: 0,
  status: "active",
  createdAt: 1_700_000_000,
};

function baseLocals(db: ReturnType<typeof mockDb>): TestLocals {
  return {
    runtime: { env: { DB: db.DB } as unknown as Env },
    user: null,
    session: null,
  };
}

describe("POST /api/chat/send", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 for malformed JSON", async () => {
    const db = mockDb();
    const locals = baseLocals(db);
    const res = await sendPost({
      request: new Request("http://localhost/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      }),
      locals: locals as unknown as Parameters<typeof sendPost>[0]["locals"],
      params: {},
    } as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid body", async () => {
    const db = mockDb();
    const locals = { ...baseLocals(db), user: { id: "user_1" }, session: { id: "s1" } };
    const res = await sendPost(buildSendContext({ conversationId: "conv_1", text: "" }, locals) as never);
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const db = mockDb({ conversations: [{ ...baseConversation }] });
    const locals = baseLocals(db);
    const res = await sendPost(buildSendContext({ conversationId: "conv_1", text: "hello" }, locals) as never);
    expect(res.status).toBe(401);
  });

  it("sends a message as Better Auth client and updates conversation", async () => {
    const db = mockDb({ conversations: [{ ...baseConversation }] });
    const locals = { ...baseLocals(db), user: { id: "user_1" }, session: { id: "s1" } };

    const res = await sendPost(buildSendContext({ conversationId: "conv_1", text: "hello artist" }, locals) as never);

    expect(res.status).toBe(201);
    const body = (await res.json()) as ChatMessage;
    expect(body.conversationId).toBe("conv_1");
    expect(body.senderId).toBe("user_1");
    expect(body.senderRole).toBe("client");
    expect(body.text).toBe("hello artist");
    expect(body.flagged).toBe(false);
    expect(typeof body.createdAt).toBe("number");

    const conv = db.conversations.get("conv_1")!;
    expect(conv.lastMessage).toBe("hello artist");
    expect(conv.lastMessageAt).toBe(body.createdAt);
    expect(conv.unread).toBe(1);
  });

  it("flags a message matching anti-bypass patterns", async () => {
    const db = mockDb({ conversations: [{ ...baseConversation }] });
    const locals = { ...baseLocals(db), user: { id: "user_1" }, session: { id: "s1" } };

    const res = await sendPost(buildSendContext({ conversationId: "conv_1", text: "contact me on line" }, locals) as never);

    expect(res.status).toBe(201);
    const body = (await res.json()) as ChatMessage;
    expect(body.flagged).toBe(true);
    expect(body.flagReason).toMatch(/line/i);
  });

  it("sends a message as artist wallet", async () => {
    const db = mockDb({ conversations: [{ ...baseConversation }] });
    const kv = mockKv();
    await kv.put("artist:tok_artist1", JSON.stringify({ artistId: "artist_1", walletAddress: "0xabc", name: "Alice" }));
    const locals = { ...baseLocals(db), runtime: { env: { DB: db.DB, SESSION: kv } as unknown as Env } };

    const res = await sendPost(buildSendContext({ conversationId: "conv_1", text: "hi client" }, locals, "artist_token=tok_artist1") as never);

    expect(res.status).toBe(201);
    const body = (await res.json()) as ChatMessage;
    expect(body.senderRole).toBe("artist");
    expect(body.senderId).toBe("artist_1");
  });

  it("sends a message as admin", async () => {
    const db = mockDb({ conversations: [{ ...baseConversation, artistId: "artist_2" }] });
    const kv = mockKv();
    await kv.put("admin:tok_admin1", "1");
    const locals = { ...baseLocals(db), runtime: { env: { DB: db.DB, SESSION: kv } as unknown as Env } };

    const res = await sendPost(buildSendContext({ conversationId: "conv_1", text: "platform notice" }, locals, "admin_token=tok_admin1") as never);

    expect(res.status).toBe(201);
    const body = (await res.json()) as ChatMessage;
    expect(body.senderRole).toBe("admin");
  });

  it("returns 404 when conversation does not exist", async () => {
    const db = mockDb();
    const locals = { ...baseLocals(db), user: { id: "user_1" }, session: { id: "s1" } };
    const res = await sendPost(buildSendContext({ conversationId: "conv_missing", text: "hello" }, locals) as never);
    expect(res.status).toBe(404);
  });

  it("returns 403 when sender is not a participant and not admin", async () => {
    const db = mockDb({ conversations: [{ ...baseConversation, clientId: "other_user", artistId: "artist_2" }] });
    const locals = { ...baseLocals(db), user: { id: "user_1" }, session: { id: "s1" } };
    const res = await sendPost(buildSendContext({ conversationId: "conv_1", text: "hello" }, locals) as never);
    expect(res.status).toBe(403);
  });
});

describe("GET /api/chat/messages/:conversationId", () => {
  it("returns 401 when not authenticated", async () => {
    const db = mockDb({ conversations: [{ ...baseConversation }] });
    const locals = baseLocals(db);
    const res = await messagesGet(buildMessagesContext("conv_1", locals) as never);
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-participant non-admin", async () => {
    const db = mockDb({ conversations: [{ ...baseConversation, clientId: "other_user", artistId: "artist_2" }] });
    const locals = { ...baseLocals(db), user: { id: "user_1" }, session: { id: "s1" } };
    const res = await messagesGet(buildMessagesContext("conv_1", locals) as never);
    expect(res.status).toBe(403);
  });

  it("lists messages and resets unread", async () => {
    const messages: ChatMessage[] = [
      { id: "msg_1", conversationId: "conv_1", senderId: "user_1", senderRole: "client", text: "first", createdAt: 1_700_000_100 },
      { id: "msg_2", conversationId: "conv_1", senderId: "artist_1", senderRole: "artist", text: "second", createdAt: 1_700_000_200 },
    ];
    const db = mockDb({ conversations: [{ ...baseConversation, unread: 3 }], messages });
    const locals = { ...baseLocals(db), user: { id: "user_1" }, session: { id: "s1" } };

    const res = await messagesGet(buildMessagesContext("conv_1", locals) as never);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { messages: ChatMessage[]; hasMore: boolean };
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].text).toBe("first");
    expect(body.messages[1].text).toBe("second");
    expect(body.hasMore).toBe(false);
    expect(db.conversations.get("conv_1")!.unread).toBe(0);
  });

  it("supports since polling", async () => {
    const messages: ChatMessage[] = [
      { id: "msg_1", conversationId: "conv_1", senderId: "user_1", senderRole: "client", text: "first", createdAt: 1_700_000_100 },
      { id: "msg_2", conversationId: "conv_1", senderId: "artist_1", senderRole: "artist", text: "second", createdAt: 1_700_000_200 },
    ];
    const db = mockDb({ conversations: [{ ...baseConversation }], messages });
    const locals = { ...baseLocals(db), user: { id: "user_1" }, session: { id: "s1" } };

    const res = await messagesGet(buildMessagesContext("conv_1", locals, { since: 1_700_000_150 }) as never);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { messages: ChatMessage[]; hasMore: boolean };
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].text).toBe("second");
  });

  it("supports limit pagination", async () => {
    const messages: ChatMessage[] = Array.from({ length: 3 }, (_, i) => ({
      id: `msg_${i}`,
      conversationId: "conv_1",
      senderId: "user_1",
      senderRole: "client",
      text: String(i),
      createdAt: 1_700_000_100 + i,
    }));
    const db = mockDb({ conversations: [{ ...baseConversation }], messages });
    const locals = { ...baseLocals(db), user: { id: "user_1" }, session: { id: "s1" } };

    const res = await messagesGet(buildMessagesContext("conv_1", locals, { limit: 2, offset: 0 }) as never);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { messages: ChatMessage[]; hasMore: boolean };
    expect(body.messages).toHaveLength(2);
    expect(body.hasMore).toBe(true);
  });

  it("allows admin access", async () => {
    const messages: ChatMessage[] = [
      { id: "msg_1", conversationId: "conv_1", senderId: "user_1", senderRole: "client", text: "hello", createdAt: 1_700_000_100 },
    ];
    const db = mockDb({ conversations: [{ ...baseConversation, clientId: "other_user" }], messages });
    const kv = mockKv();
    await kv.put("admin:tok_admin1", "1");
    const locals = { ...baseLocals(db), runtime: { env: { DB: db.DB, SESSION: kv } as unknown as Env } };

    const res = await messagesGet(buildMessagesContext("conv_1", locals, { cookie: "admin_token=tok_admin1" }) as never);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { messages: ChatMessage[] };
    expect(body.messages).toHaveLength(1);
  });
});
