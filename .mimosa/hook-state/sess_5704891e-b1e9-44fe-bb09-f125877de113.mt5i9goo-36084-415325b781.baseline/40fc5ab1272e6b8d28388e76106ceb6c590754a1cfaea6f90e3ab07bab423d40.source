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
 *
 * Auth note: the route accepts three kinds of session - admin (admin_token
 * cookie), artist (wallet-signature KV), client (locals.user from Better
 * Auth). The admin branch supports a ?artistId filter. This file uses the
 * adminRequest fixture for the auth'd cases.
 *
 * Prerequisite: `pnpm db:seed:dev` must have run (creates conv-test-001
 * with client_id=test-client, artist_id=mara).
 */

import { test, expect } from "../fixtures";

test.describe("GET /api/chat/conversations - unauthenticated", () => {
  test("returns 401 when not authenticated", async ({ request }) => {
    const res = await request.get("/api/chat/conversations");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });
});

test.describe("GET /api/chat/conversations - as admin", () => {
  test("returns the list of conversations", async ({ adminRequest }) => {
    const res = await adminRequest.get("/api/chat/conversations");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("conversations");
    expect(Array.isArray(body.conversations)).toBe(true);
    // The seeded conv-test-001 should be in the list.
    const ids = (body.conversations as Array<{ id: string }>).map((c) => c.id);
    expect(ids).toContain("conv-test-001");
  });

  test("admin can filter by ?artistId=...", async ({ adminRequest }) => {
    // The seed has conv-test-001 with artist_id='mara'. Filter by 'mara'
    // and we should see it. Filter by a non-existent artist and we get [].
    const filtered = await adminRequest.get(
      "/api/chat/conversations?artistId=mara",
    );
    expect(filtered.status()).toBe(200);
    const body = await filtered.json();
    const ids = (body.conversations as Array<{ id: string }>).map((c) => c.id);
    expect(ids).toContain("conv-test-001");

    const empty = await adminRequest.get(
      "/api/chat/conversations?artistId=no-such-artist",
    );
    expect(empty.status()).toBe(200);
    const emptyBody = await empty.json();
    expect(emptyBody.conversations).toEqual([]);
  });
});

test.describe("GET /api/chat/conversations/[id] - unauthenticated", () => {
  test("returns 401 when not authenticated", async ({ request }) => {
    const res = await request.get("/api/chat/conversations/any-id");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });
});

test.describe("GET /api/chat/conversations/[id] - as admin", () => {
  test("returns 200 with the conversation and the joined artist name/handle", async ({ adminRequest }) => {
    const res = await adminRequest.get("/api/chat/conversations/conv-test-001");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("conversation");
    const conv = body.conversation as Record<string, unknown>;
    expect(conv).toMatchObject({
      id: "conv-test-001",
      client_id: "test-client",
      artist_id: "mara",
      status: "active",
    });
    // The route joins artists; the seeded row has name='Mara Vael'
    // and handle='@maravael' (from migrations/0002_seed.sql).
    expect(conv.artist_name).toBe("Mara Vael");
    expect(conv.artist_handle).toBe("@maravael");
  });

  test("returns 404 when the conversation does not exist", async ({ adminRequest }) => {
    const res = await adminRequest.get("/api/chat/conversations/conv-does-not-exist");
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not found");
  });
});
