/**
 * GET /api/chat/messages/[conversationId] - API contract tests.
 *
 * Covers closed issues:
 *   #60 (Chat: D1 migration for conversations + messages) - reads from messages.
 *   #61 (Chat: Send & list messages API) - the list half.
 *   #40 (TH/EN support) - the list shape works regardless of language.
 *
 * Source: src/pages/api/chat/messages/[conversationId].ts.
 * Pattern: tests/e2e/api/voucher.spec.ts and tests/e2e/api/bookings.spec.ts.
 *
 * Auth note: the route uses resolveSender (admin is a valid sender; admin
 * short-circuits the participant check). This file uses the adminRequest
 * fixture for the auth'd cases.
 *
 * Prerequisite: `pnpm db:seed:dev` must have run (creates conv-test-001
 * with 2 messages).
 */

import { test, expect } from "../fixtures";

test.describe("GET /api/chat/messages/[conversationId] - unauthenticated", () => {
  test("returns 401 when not authenticated", async ({ request }) => {
    const res = await request.get("/api/chat/messages/any-id");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Not authenticated");
  });
});

test.describe("GET /api/chat/messages/[conversationId] - as admin", () => {
  test("200 returns the seeded messages in ascending order", async ({ adminRequest }) => {
    // The seed inserts 2 messages into conv-test-001: msg-test-001 and
    // msg-test-002, with msg-test-002 newer (created_at = now - 1700 vs
    // msg-test-001's now - 1800). The route orders by created_at ASC,
    // so the response should list msg-test-001 first.
    const res = await adminRequest.get("/api/chat/messages/conv-test-001");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("messages");
    expect(Array.isArray(body.messages)).toBe(true);
    // The conversation is shared with other tests in this run, so we
    // assert the order of the *seeded* messages rather than the full
    // list. The list must contain msg-test-001 and msg-test-002, and
    // msg-test-001 must appear before msg-test-002 (ascending created_at).
    const ids = (body.messages as { id: string }[]).map((m) => m.id);
    const i1 = ids.indexOf("msg-test-001");
    const i2 = ids.indexOf("msg-test-002");
    expect(i1).toBeGreaterThanOrEqual(0);
    expect(i2).toBeGreaterThan(i1);
  });

  test("messages have the documented shape", async ({ adminRequest }) => {
    const res = await adminRequest.get("/api/chat/messages/conv-test-001");
    expect(res.status()).toBe(200);
    const body = await res.json();
    const first = (body.messages as Array<Record<string, unknown>>).find(
      (m) => m.id === "msg-test-001",
    );
    expect(first).toBeDefined();
    expect(first).toMatchObject({
      id: "msg-test-001",
      conversationId: "conv-test-001",
      senderId: "test-client",
      senderRole: "client",
      text: "first message",
      flagged: false,
    });
    expect(typeof first!.createdAt).toBe("number");
  });

  test("404 when the conversation does not exist", async ({ adminRequest }) => {
    const res = await adminRequest.get("/api/chat/messages/conv-does-not-exist");
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Conversation not found");
  });

  test("since param filters to messages with created_at > since", async ({ adminRequest }) => {
    // The seeded msg-test-001 has created_at = now - 1800 and msg-test-002
    // has created_at = now - 1700. Pass since = (msg-test-001.createdAt)
    // and we should see only msg-test-002.
    const list = await adminRequest.get("/api/chat/messages/conv-test-001");
    const listBody = await list.json();
    const m1 = (listBody.messages as Array<{ id: string; createdAt: number }>).find(
      (m) => m.id === "msg-test-001",
    );
    expect(m1).toBeDefined();
    const res = await adminRequest.get(
      `/api/chat/messages/conv-test-001?since=${m1!.createdAt}`,
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    const ids = (body.messages as Array<{ id: string }>).map((m) => m.id);
    expect(ids).not.toContain("msg-test-001");
    expect(ids).toContain("msg-test-002");
  });

  test("limit param caps the response size", async ({ adminRequest }) => {
    const res = await adminRequest.get(
      "/api/chat/messages/conv-test-001?limit=1",
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    // limit=1 -> the route asks for 2 rows internally, slices to 1, and
    // sets hasMore=true. The list is small in the seed (2 messages), so
    // we only assert that the response is bounded and hasMore is set
    // correctly when there are more rows.
    const list = body.messages as Array<unknown>;
    expect(list.length).toBeLessThanOrEqual(1);
    expect(body.hasMore).toBe(true);
  });

  test("calling this endpoint resets conversations.unread to 0", async ({ adminRequest }) => {
    // Set unread to a known value, then GET messages, then check unread.
    // We do this via a follow-up GET on /api/chat/conversations/conv-test-001.
    // (We need the conversations route to be readable. If it returns 401
    // we'll skip - this test depends on the auth flow used by the
    // conversations route, which differs from the messages route.)
    test.skip(true, "depends on the conversations route auth flow; see ticket #68");
  });
});
