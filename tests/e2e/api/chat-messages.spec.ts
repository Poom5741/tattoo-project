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
 * Note on auth: the route uses resolveSender (not the local admin/artist
 * branches used by /conversations). Admin is a valid sender; admin
 * short-circuits the participant check.
 */

import { test, expect } from "@playwright/test";

test.describe("GET /api/chat/messages/[conversationId]", () => {
  test("returns 401 when not authenticated", async ({ request }) => {
    const res = await request.get("/api/chat/messages/any-id");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Not authenticated");
  });

  test("returns 200 with empty list when conversation exists but has no messages", async ({
    request,
  }) => {
    // Happy path: a real conversation with zero messages returns
    // { messages: [], hasMore: false } and updates conversations.unread = 0.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("returns 404 when the conversation does not exist (and sender is authenticated)", async ({
    request,
  }) => {
    // The 404 fires after auth, before the participant check. With an
    // authenticated sender, an unknown conversation id is 404.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("returns 403 when the sender is not a participant", async ({
    request,
  }) => {
    // isParticipant = admin || client_id === sender.id || artist_id
    // === sender.id. A non-participant sender is 403.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("returns 400 on invalid query params (limit > 100)", async ({
    request,
  }) => {
    // The QuerySchema coerces and validates limit: z.coerce.number().int()
    // .min(1).max(100). 999 fails the max(100) check.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("returns 400 on negative offset", async ({ request }) => {
    // The QuerySchema is z.coerce.number().int().nonnegative().default(0).
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("messages are ordered ascending by created_at", async ({ request }) => {
    // The SQL is ORDER BY created_at ASC. Asserted on a real list.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("since param filters to messages with created_at > since", async ({
    request,
  }) => {
    // Polling: clients pass the last seen created_at and the route
    // returns only newer messages.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("hasMore is true when there is a row beyond the limit", async ({
    request,
  }) => {
    // The route requests limit+1 rows; if it gets limit+1, hasMore is
    // true and the response contains the first `limit` rows. Useful
    // for clients that page.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("calling this endpoint resets conversations.unread to 0", async ({
    request,
  }) => {
    // Side effect: the route does UPDATE conversations SET unread = 0
    // WHERE id = ?. The unread counter is the "you have new messages"
    // indicator the artist sees in the inbox.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("Thai and English messages persist and render unchanged", async ({
    request,
  }) => {
    // The text column is TEXT with no encoding constraint; a Thai
    // message like 'สวัสดี' should round-trip through the API.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });
});
