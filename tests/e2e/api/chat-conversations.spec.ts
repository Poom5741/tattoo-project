/**
 * GET /api/chat/conversations and GET /api/chat/conversations/[id] - API
 * contract tests.
 *
 * Covers closed issues:
 *   #60 (Chat: D1 migration for conversations + messages) - reads from the table.
 *   #62 (Chat: Artist inbox & conversations API) - the artist-side read.
 *   #41 (Chat Booking Integration) - the listing shape the admin/artist sees.
 *
 * Source: src/pages/api/chat/conversations/index.ts and [id].ts.
 * Pattern: tests/e2e/api/voucher.spec.ts and tests/e2e/api/bookings.spec.ts.
 */

import { test, expect } from "@playwright/test";

test.describe("GET /api/chat/conversations", () => {
  test("returns 401 when not authenticated", async ({ request }) => {
    // The route checks user || artistSession || admin; with none of
    // those, it returns 401 before any DB query.
    const res = await request.get("/api/chat/conversations");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("returns 401 for invalid JSON in headers (no body expected)", async ({
    request,
  }) => {
    // GET has no body; this asserts the route does not accidentally
    // crash on a malformed Content-Type header.
    const res = await request.get("/api/chat/conversations", {
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(401);
  });

  test("returns { conversations: [] } shape when authenticated with empty D1", async ({
    request,
  }) => {
    // The happy path with no rows. Requires an authenticated session
    // (admin via password, or artist via wallet signature). The D1
    // schema has a conversations table; if it's empty, the response
    // is { conversations: [] }. The order is last_message_at DESC.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("admin can filter conversations by ?artistId=...", async ({
    request,
  }) => {
    // The admin branch appends WHERE artist_id = ? when the URL has
    // ?artistId. The artist and client branches do not honour this
    // filter - they scope to themselves unconditionally.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("artist sees only their own conversations", async ({ request }) => {
    // The artist branch scopes WHERE artist_id = ? to the artist's id.
    // Asserts no cross-artist leak.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("client sees only their own conversations", async ({ request }) => {
    // The client branch scopes WHERE client_id = ? to the client's id
    // (from locals.user.id).
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });
});

test.describe("GET /api/chat/conversations/[id]", () => {
  test("returns 401 when not authenticated", async ({ request }) => {
    const res = await request.get("/api/chat/conversations/any-id");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("returns 404 when the conversation does not exist (and sender is authenticated)", async ({
    request,
  }) => {
    // With an authenticated sender and a missing id, the route returns
    // 404 "Not found". The 401 path runs first if the sender is null.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("returns 403 when the sender is not a participant", async ({
    request,
  }) => {
    // The isParticipant check is admin || user.id === client_id ||
    // artistSession.artistId === artist_id. A non-participant sender
    // gets 403.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });

  test("200 response shape joins the artist name and handle", async ({
    request,
  }) => {
    // The SELECT joins artists: c.*, a.name AS artist_name, a.handle
    // AS artist_handle. The response is { conversation: { ... } }.
    test.skip(true, "needs an authenticated-sender fixture; see ticket #67");
  });
});
