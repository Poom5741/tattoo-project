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
 * "unauthenticated" path is testable without a fixture. The authenticated
 * paths use the `adminRequest` fixture (admin bypasses the participant
 * check, so admin can send into any conversation). The non-admin
 * participant / non-participant paths are still test.skip because they
 * need a real artist KV session or Better Auth signup.
 *
 * Prerequisite: the dev D1 must have been seeded with `pnpm db:seed:dev`
 * (which creates the `conv-test-001` row referenced below). Without it,
 * the 404 / 201 / flagged tests fail.
 */

import { test, expect } from "../fixtures";

test.describe("POST /api/chat/send - unauthenticated", () => {
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
});

test.describe("POST /api/chat/send - as admin", () => {
  test("404 when the conversation does not exist", async ({ adminRequest }) => {
    const res = await adminRequest.post("/api/chat/send", {
      data: { conversationId: "conv-does-not-exist", text: "hello" },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Conversation not found");
  });

  test("201 happy path persists a message and returns the new row", async ({ adminRequest }) => {
    const res = await adminRequest.post("/api/chat/send", {
      data: { conversationId: "conv-test-001", text: "smoke from admin" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      conversationId: "conv-test-001",
      senderRole: "admin",
      text: "smoke from admin",
      flagged: false,
    });
    expect(typeof body.id).toBe("string");
    expect(typeof body.createdAt).toBe("number");
    expect(body.flagReason).toBeFalsy();
  });

  test("anti-bypass: a message containing http(s):// is flagged with flagReason", async ({ adminRequest }) => {
    // ANTI_BYPASS_PATTERNS[0] is /https?:\/\//i.
    const res = await adminRequest.post("/api/chat/send", {
      data: { conversationId: "conv-test-001", text: "visit https://example.com" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.flagged).toBe(true);
    // The server returns `Pattern matched: ${pattern.source}`, so for
    // /https?:\/\//i the source is 'https?:\\/\\/' (escaped). Assert on
    // the 'Pattern matched:' prefix and the bare 'https' substring.
    expect(body.flagReason).toMatch(/Pattern matched/);
    expect(body.flagReason).toContain("https");
  });

  test("anti-bypass: a message containing @handle is flagged", async ({ adminRequest }) => {
    // ANTI_BYPASS_PATTERNS[1] is /@[a-z0-9_-]+/i.
    const res = await adminRequest.post("/api/chat/send", {
      data: { conversationId: "conv-test-001", text: "follow me @someone" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.flagged).toBe(true);
    expect(body.flagReason).toMatch(/@/);
  });

  test("anti-bypass: 'whatsapp' / 'line' / 't.me' are flagged", async ({ adminRequest }) => {
    // ANTI_BYPASS_PATTERNS[2] is /(line|whatsapp|fb|ig|t.me|telegram)/i.
    for (const token of ["whatsapp me", "line id", "t.me/foo"]) {
      const res = await adminRequest.post("/api/chat/send", {
        data: { conversationId: "conv-test-001", text: token },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.flagged, `expected '${token}' to be flagged`).toBe(true);
    }
  });

  test("anti-bypass: 9+ consecutive digits is flagged", async ({ adminRequest }) => {
    // ANTI_BYPASS_PATTERNS[3] is /\d{9,}/i.
    const res = await adminRequest.post("/api/chat/send", {
      data: { conversationId: "conv-test-001", text: "call 1234567890" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.flagged).toBe(true);
  });

  test("clean message returns flagged: false and no flagReason", async ({ adminRequest }) => {
    // No pattern matched. The text 'no patterns here' has no http, no @handle,
    // no contact-platform name, and no 9+ digits.
    const res = await adminRequest.post("/api/chat/send", {
      data: { conversationId: "conv-test-001", text: "no patterns here" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.flagged).toBe(false);
    expect(body.flagReason).toBeFalsy();
  });
});
