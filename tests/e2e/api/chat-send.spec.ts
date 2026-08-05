/**
 * POST /api/chat/send — API contract tests.
 *
 * Covers closed issues:
 *   #60 (Chat: D1 migration for conversations + messages) - the route persists.
 *   #61 (Chat: Send & list messages API) - this is the send half.
 *   #30 / #39 (anti-bypass strategy) - the four ANTI_BYPASS_PATTERNS.
 *   #40 (anti-bypass filtering) - the flagged: true / flagReason shape.
 *
 * Source: src/pages/api/chat/send.ts and src/lib/chat/schema.ts.
 * Pattern: tests/e2e/api/voucher.spec.ts and tests/e2e/api/bookings.spec.ts.
 *
 * Auth note: the route calls resolveSender(cookie, env.SESSION, locals.user).
 * Three kinds of session qualify - admin (admin_token cookie), artist
 * (wallet-signature KV), or client (locals.user from Better Auth). The
 * "unauthenticated" path is testable without a fixture. The "happy path"
 * paths (201, flagged: true, anti-bypass) need an authenticated sender
 * AND a real conversation row, which requires a fixture. Those are
 * marked test.skip with a pointer to the fixture work.
 */

import { test, expect } from "@playwright/test";

test.describe("POST /api/chat/send", () => {
  // --- request-shape failures (run before any auth check) ---

  test("returns 400 for empty body", async ({ request }) => {
    const res = await request.post("/api/chat/send", { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("returns 400 for invalid JSON", async ({ request }) => {
    const res = await request.post("/api/chat/send", {
      headers: { "content-type": "application/json" },
      data: "not-json",
    });
    expect(res.status()).toBe(400);
  });

  test("returns 400 when conversationId is missing", async ({ request }) => {
    const res = await request.post("/api/chat/send", {
      data: { text: "hello" },
    });
    expect(res.status()).toBe(400);
  });

  test("returns 400 when text is missing", async ({ request }) => {
    const res = await request.post("/api/chat/send", {
      data: { conversationId: "any-id" },
    });
    expect(res.status()).toBe(400);
  });

  test("returns 400 when text is empty string", async ({ request }) => {
    // The Zod schema is z.string().min(1).max(2000); empty string fails min(1).
    const res = await request.post("/api/chat/send", {
      data: { conversationId: "any-id", text: "" },
    });
    expect(res.status()).toBe(400);
  });

  // --- auth gate (runs before any DB lookup) ---

  test("returns 401 when not authenticated", async ({ request }) => {
    // With no cookie, no KV session, and no locals.user, resolveSender
    // returns null. The route returns 401 "Not authenticated" before
    // the conversation lookup.
    const res = await request.post("/api/chat/send", {
      data: { conversationId: "any-id", text: "hello" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Not authenticated");
  });

  // --- happy / business-rule paths (need a conversation row fixture) ---

  test("201 happy path persists a message and returns the new row", async ({
    request,
  }) => {
    // Requires an authenticated sender + a seeded conversation id.
    // The migrations/0002_seed.sql does not seed any conversations; the
    // chat tables are created in 0010_chat.sql and left empty. Until a
    // chat seed (or a per-test fixture that inserts a conversation)
    // exists, this test is a placeholder.
    test.skip(true, "needs a conversation-row fixture; see ticket #67");
  });

  test("anti-bypass: a message containing http(s):// is flagged with flagReason", async ({
    request,
  }) => {
    // ANTI_BYPASS_PATTERNS[0] is /https?:\/\//i. The route persists
    // flagged=1 + flag_reason='Pattern matched: /https?:\\/\\//i' and
    // returns flagged: true, flagReason set.
    test.skip(true, "needs a conversation-row fixture; see ticket #67");
  });

  test("anti-bypass: a message containing @handle is flagged", async ({
    request,
  }) => {
    // ANTI_BYPASS_PATTERNS[1] is /@[a-z0-9_-]+/i.
    test.skip(true, "needs a conversation-row fixture; see ticket #67");
  });

  test("anti-bypass: a message containing 'whatsapp' / 'line' / 't.me' is flagged", async ({
    request,
  }) => {
    // ANTI_BYPASS_PATTERNS[2] is /(line|whatsapp|fb|ig|t.me|telegram)/i.
    test.skip(true, "needs a conversation-row fixture; see ticket #67");
  });

  test("anti-bypass: a message containing 9+ consecutive digits is flagged", async ({
    request,
  }) => {
    // ANTI_BYPASS_PATTERNS[3] is /\d{9,}/i.
    test.skip(true, "needs a conversation-row fixture; see ticket #67");
  });

  test("clean message (no pattern matched) returns flagged: false and no flagReason", async ({
    request,
  }) => {
    // The default path: filterMessage returns { clean: true } and the
    // route persists flagged=0, flag_reason=NULL.
    test.skip(true, "needs a conversation-row fixture; see ticket #67");
  });

  test("returns 404 when the conversation does not exist (and sender is authenticated)", async ({
    request,
  }) => {
    // The unauthenticated path returns 401 first. With an authenticated
    // sender, an unknown conversation id returns 404. Requires the
    // same fixture as the happy path.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("returns 403 when the sender is not a participant in the conversation", async ({
    request,
  }) => {
    // The route checks isParticipant = sender.role === "admin" ||
    // conversation.client_id === sender.id || conversation.artist_id
    // === sender.id. A non-participant sender returns 403.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });
});
