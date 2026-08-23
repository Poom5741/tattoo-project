/**
 * Chat Messaging — buyer-artist message visibility bugs
 *
 * BUG: Buyer doesn't get message back from artist.
 *
 * Root causes documented by these tests:
 *
 * 1. UNREAD COUNTER IS NOT PER-ROLE (send.ts lines 75-80)
 *    The `unread` counter on conversations is incremented for EVERY message
 *    sent, regardless of sender_role. When the buyer reads the conversation
 *    (GET /api/chat/messages/:id), unread is reset to 0 for the entire
 *    conversation — not just the reader's side. This means if both sides
 *    poll the messages endpoint, the counter never accurately tracks
 *    unread messages for either party.
 *
 * 2. MESSAGES ENDPOINT RESETS UNREAD FOR EVERYONE
 *    (messages/[conversationId].ts lines 106-108)
 *    `UPDATE conversations SET unread = 0 WHERE id = ?` fires on every
 *    GET /api/chat/messages/:id call. If the buyer polls for new messages,
 *    the unread count resets even though the artist may not have read
 *    anything. There is no `reader_role` parameter to scope the reset.
 *
 * 3. NO REAL-TIME DELIVERY MECHANISM
 *    There is no WebSocket, SSE endpoint, or client-side polling interval
 *    that would push new messages to the buyer. The buyer must manually
 *    refresh /api/chat/messages to see artist replies.
 *
 * These tests lock the current contract so any future fix can be validated
 * against regressions. Tests that assert buggy behaviour are annotated
 * with `BUG:` comments.
 *
 * Auth note: the admin login endpoint rate-limits at ~5 rapid calls (429).
 * All authenticated tests are consolidated into ONE test body to use a
 * single `adminRequest` context and avoid the rate limiter.
 *
 * Source: src/pages/api/chat/send.ts, src/pages/api/chat/messages/[conversationId].ts,
 *         src/pages/api/chat/conversations/index.ts
 *
 * Prerequisite: `pnpm db:seed:dev` must have run (creates conv-test-001
 * with 2 messages seeded).
 */

import { test, expect, type APIRequestContext } from "../fixtures";
import { DatabaseSync } from "node:sqlite";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Find all D1 sqlite files under the Wrangler state directory. */
function findD1Paths(): string[] {
  const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
  if (!existsSync(d1Dir)) return [];
  const files = readdirSync(d1Dir)
    .filter(
      (f: string) =>
        f.endsWith(".sqlite") && !f.endsWith("-wal") && !f.endsWith("-shm"),
    )
    .map((f: string) => ({
      f,
      mtime: statSync(join(d1Dir, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);
  return files.map((file: { f: string }) => join(d1Dir, file.f));
}

/** Fetch a single conversation via the API (avoids WAL/direct-read issues). */
async function fetchConversation(
  api: APIRequestContext,
  id: string,
): Promise<{ unread: number; lastMessage: string | null; lastMessageAt: number | null } | null> {
  const res = await api.get(`/api/chat/conversations/${id}`);
  if (res.status() !== 200) return null;
  const body = await res.json();
  const c = body.conversation;
  if (!c) return null;
  return {
    unread: c.unread ?? 0,
    lastMessage: c.last_message ?? null,
    lastMessageAt: c.last_message_at ?? null,
  };
}

/** Directly set the `unread` column on a conversation in D1. */
function setUnread(conversationId: string, value: number): void {
  const dbPaths = findD1Paths();
  for (const dbPath of dbPaths) {
    const con = new DatabaseSync(dbPath);
    try {
      con
        .prepare("UPDATE conversations SET unread = ? WHERE id = ?")
        .run(value, conversationId);
    } catch {
      // ignore
    } finally {
      con.close();
    }
  }
}

/** Clean up messages inserted during a test by their text prefix. */
function cleanTestMessages(conversationId: string, textPrefix: string): void {
  const dbPaths = findD1Paths();
  for (const dbPath of dbPaths) {
    const con = new DatabaseSync(dbPath);
    try {
      con
        .prepare(
          `DELETE FROM messages WHERE conversation_id = ? AND text LIKE ?`,
        )
        .run(conversationId, `${textPrefix}%`);
    } catch {
      // ignore
    } finally {
      con.close();
    }
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEST_CONVERSATION_ID = "conv-test-001";

// ---------------------------------------------------------------------------
// Tests — unauthenticated (use bare `request` fixture, no login needed)
// ---------------------------------------------------------------------------

test.describe("Chat messaging — access control (unauthenticated)", () => {
  test("messages endpoint returns 401 when not authenticated", async ({
    request,
  }) => {
    const res = await request.get(
      `/api/chat/messages/${TEST_CONVERSATION_ID}`,
    );
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Not authenticated");
  });

  test("conversations endpoint returns 401 when not authenticated", async ({
    request,
  }) => {
    const res = await request.get("/api/chat/conversations");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("send endpoint returns 401 when not authenticated", async ({
    request,
  }) => {
    const res = await request.post("/api/chat/send", {
      data: {
        conversationId: TEST_CONVERSATION_ID,
        text: "should fail",
      },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Not authenticated");
  });
});

// ---------------------------------------------------------------------------
// Tests — authenticated (single test body, single adminRequest context)
//
// The admin login endpoint rate-limits at ~5 rapid calls with 429.
// Every `adminRequest` fixture instantiation triggers a login. To avoid
// hitting the rate limiter, ALL authenticated assertions are packed into
// one test that shares a single adminRequest context.
// ---------------------------------------------------------------------------

test.describe(
  "Chat messaging — full contract + unread bugs (single auth context)",
  () => {
    test("send/read, visibility, pagination, conversation list, 404s, and unread counter bugs", async ({
      adminRequest,
    }) => {
      // =================================================================
      // SECTION 1: Send a message and verify it appears
      // =================================================================

      // NOTE: Message text must avoid anti-bypass patterns:
      //   - URLs (https?://)
      //   - @handles (@word)
      //   - platform names (line, whatsapp, fb, ig, t.me, telegram)
      //     Note: t.me uses unescaped `.` so "t me" also matches
      //   - 9+ consecutive digits (\d{9,})
      const sendText = "hello from admin to artist";
      const sendRes = await adminRequest.post("/api/chat/send", {
        data: {
          conversationId: TEST_CONVERSATION_ID,
          text: sendText,
        },
      });
      expect(sendRes.status()).toBe(201);
      const sendBody = await sendRes.json();
      expect(sendBody).toHaveProperty("id");
      expect(sendBody.text).toBe(sendText);
      expect(sendBody.conversationId).toBe(TEST_CONVERSATION_ID);
      expect(sendBody.senderRole).toBe("admin"); // adminRequest sends as admin
      expect(sendBody.flagged).toBe(false);
      expect(sendBody.flagReason).toBeFalsy();
      expect(typeof sendBody.createdAt).toBe("number");

      // Timestamp should be within 5 seconds of now.
      const now = Math.floor(Date.now() / 1000);
      expect(Math.abs(sendBody.createdAt - now)).toBeLessThanOrEqual(5);

      // =================================================================
      // SECTION 2: Read messages back — buyer can see artist reply
      // =================================================================

      const msgRes = await adminRequest.get(
        `/api/chat/messages/${TEST_CONVERSATION_ID}`,
      );
      expect(msgRes.status()).toBe(200);
      const msgBody = await msgRes.json();
      expect(msgBody).toHaveProperty("messages");
      expect(Array.isArray(msgBody.messages)).toBe(true);

      // Our sent message should appear in the list.
      const found = msgBody.messages.find(
        (m: { text: string }) => m.text === sendText,
      );
      expect(found).toBeDefined();
      expect(found.senderRole).toBe("admin");
      expect(found.senderId).toBeTruthy();
      expect(typeof found.createdAt).toBe("number");

      // Seeded messages (msg-test-001, msg-test-002) should also be present.
      const allIds = msgBody.messages.map((m: { id: string }) => m.id);
      expect(allIds).toContain("msg-test-001");
      expect(allIds).toContain("msg-test-002");

      // msg-test-001 should appear before msg-test-002 (ascending order).
      const i1 = allIds.indexOf("msg-test-001");
      const i2 = allIds.indexOf("msg-test-002");
      expect(i2).toBeGreaterThan(i1);

      // =================================================================
      // SECTION 3: Conversation last_message is updated
      // =================================================================

      // Use the API to read conversation state (avoids WAL/direct-read
      // issues with node:sqlite against the server's D1 file).
      const conv = await fetchConversation(adminRequest, TEST_CONVERSATION_ID);
      expect(conv).not.toBeNull();
      expect(conv!.lastMessage).toBe(sendText);
      expect(conv!.lastMessageAt).toBeGreaterThan(0);

      // =================================================================
      // SECTION 4: Pagination
      // =================================================================

      // limit=1 returns at most 1 message, hasMore=true
      const limitRes = await adminRequest.get(
        `/api/chat/messages/${TEST_CONVERSATION_ID}?limit=1`,
      );
      expect(limitRes.status()).toBe(200);
      const limitBody = await limitRes.json();
      expect(limitBody.messages.length).toBeLessThanOrEqual(1);
      // Seeded conversation has 2+ messages, so hasMore should be true.
      expect(limitBody.hasMore).toBe(true);

      // offset=1 skips the first message
      const offsetRes = await adminRequest.get(
        `/api/chat/messages/${TEST_CONVERSATION_ID}?offset=1`,
      );
      expect(offsetRes.status()).toBe(200);
      const offsetBody = await offsetRes.json();
      const offsetIds = offsetBody.messages.map(
        (m: { id: string }) => m.id,
      );
      expect(offsetIds).not.toContain(allIds[0]);
      expect(offsetIds.length).toBe(allIds.length - 1);

      // limit + offset combined
      const comboRes = await adminRequest.get(
        `/api/chat/messages/${TEST_CONVERSATION_ID}?limit=1&offset=1`,
      );
      expect(comboRes.status()).toBe(200);
      const comboBody = await comboRes.json();
      expect(comboBody.messages.length).toBeLessThanOrEqual(1);

      // Invalid params return 400
      const badLimit0 = await adminRequest.get(
        `/api/chat/messages/${TEST_CONVERSATION_ID}?limit=0`,
      );
      expect(badLimit0.status()).toBe(400);

      const badLimit101 = await adminRequest.get(
        `/api/chat/messages/${TEST_CONVERSATION_ID}?limit=101`,
      );
      expect(badLimit101.status()).toBe(400);

      const badOffset = await adminRequest.get(
        `/api/chat/messages/${TEST_CONVERSATION_ID}?offset=-1`,
      );
      expect(badOffset.status()).toBe(400);

      // =================================================================
      // SECTION 5: Conversation list shows lastMessage and unread
      // =================================================================

      const listRes = await adminRequest.get("/api/chat/conversations");
      expect(listRes.status()).toBe(200);
      const listBody = await listRes.json();
      expect(listBody).toHaveProperty("conversations");
      expect(Array.isArray(listBody.conversations)).toBe(true);

      const convInList = listBody.conversations.find(
        (c: { id: string }) => c.id === TEST_CONVERSATION_ID,
      );
      expect(convInList).toBeDefined();
      expect(convInList.lastMessage).toBe(sendText);
      expect(convInList.lastMessageAt).toBeGreaterThan(0);
      expect(typeof convInList.unread).toBe("number");

      // =================================================================
      // SECTION 6: 404 for non-existent conversations (authenticated)
      // =================================================================

      const missingMsg = await adminRequest.get(
        "/api/chat/messages/conv-does-not-exist",
      );
      expect(missingMsg.status()).toBe(404);
      const missingMsgBody = await missingMsg.json();
      expect(missingMsgBody.error).toBe("Conversation not found");

      const missingSend = await adminRequest.post("/api/chat/send", {
        data: {
          conversationId: "conv-does-not-exist",
          text: "should fail",
        },
      });
      expect(missingSend.status()).toBe(404);
      const missingSendBody = await missingSend.json();
      expect(missingSendBody.error).toBe("Conversation not found");

      const missingConv = await adminRequest.get(
        "/api/chat/conversations/conv-does-not-exist",
      );
      expect(missingConv.status()).toBe(404);
      const missingConvBody = await missingConv.json();
      expect(missingConvBody.error).toBe("Not found");

      // =================================================================
      // SECTION 7: BUG — unread counter is not per-role
      // =================================================================
      //
      // send.ts lines 75-80:
      //   UPDATE conversations SET unread = unread + 1 WHERE id = ?
      // This fires for EVERY message, regardless of sender_role.
      // The counter is a single integer, not split by role.

      // Reset unread to 0.
      setUnread(TEST_CONVERSATION_ID, 0);
      let unreadConv = await fetchConversation(adminRequest, TEST_CONVERSATION_ID);
      expect(unreadConv!.unread).toBe(0);

      // Send a message (simulating buyer-side).
      const unreadSend1 = await adminRequest.post("/api/chat/send", {
        data: {
          conversationId: TEST_CONVERSATION_ID,
          text: "bug-test unread-buyer",
        },
      });
      expect(unreadSend1.status()).toBe(201);

      // BUG: unread is 1 even though the buyer sent the message.
      unreadConv = await fetchConversation(adminRequest, TEST_CONVERSATION_ID);
      expect(unreadConv!.unread).toBe(1);

      // Reset and send another (simulating artist reply).
      setUnread(TEST_CONVERSATION_ID, 0);

      const unreadSend2 = await adminRequest.post("/api/chat/send", {
        data: {
          conversationId: TEST_CONVERSATION_ID,
          text: "bug-test unread-artist",
        },
      });
      expect(unreadSend2.status()).toBe(201);

      // BUG: unread is 1 again — the counter treats buyer and artist
      // sends identically.
      unreadConv = await fetchConversation(adminRequest, TEST_CONVERSATION_ID);
      expect(unreadConv!.unread).toBe(1);

      // =================================================================
      // SECTION 8: BUG — GET /api/messages resets unread globally
      // =================================================================
      //
      // messages/[conversationId].ts lines 106-108:
      //   UPDATE conversations SET unread = 0 WHERE id = ?
      // This fires on every GET, regardless of who is reading.

      // Set unread to 5 to simulate unread messages.
      setUnread(TEST_CONVERSATION_ID, 5);
      unreadConv = await fetchConversation(adminRequest, TEST_CONVERSATION_ID);
      expect(unreadConv!.unread).toBe(5);

      // Buyer reads messages.
      const unreadMsgRes = await adminRequest.get(
        `/api/chat/messages/${TEST_CONVERSATION_ID}`,
      );
      expect(unreadMsgRes.status()).toBe(200);

      // BUG: unread is now 0. If the buyer reads but the artist hasn't,
      // the artist's unread count is also wiped.
      unreadConv = await fetchConversation(adminRequest, TEST_CONVERSATION_ID);
      expect(unreadConv!.unread).toBe(0);

      // =================================================================
      // SECTION 9: BUG — rapid buyer poll wipes artist unread count
      // =================================================================
      //
      // This reproduces the "buyer doesn't see artist reply" scenario:
      // 1. Artist sends message -> unread = 1
      // 2. Buyer polls -> unread = 0 (wiped for everyone)
      // 3. Artist sends another -> unread = 1
      // 4. Buyer polls again -> unread = 0
      //
      // The buyer never sees a persistent unread badge because each poll
      // resets the global counter.

      setUnread(TEST_CONVERSATION_ID, 0);

      // Artist message 1.
      await adminRequest.post("/api/chat/send", {
        data: {
          conversationId: TEST_CONVERSATION_ID,
          text: "bug-test poll-one",
        },
      });
      unreadConv = await fetchConversation(adminRequest, TEST_CONVERSATION_ID);
      expect(unreadConv!.unread).toBe(1);

      // Buyer reads.
      await adminRequest.get(`/api/chat/messages/${TEST_CONVERSATION_ID}`);
      unreadConv = await fetchConversation(adminRequest, TEST_CONVERSATION_ID);
      expect(unreadConv!.unread).toBe(0);

      // Artist message 2.
      await adminRequest.post("/api/chat/send", {
        data: {
          conversationId: TEST_CONVERSATION_ID,
          text: "bug-test poll-two",
        },
      });
      unreadConv = await fetchConversation(adminRequest, TEST_CONVERSATION_ID);
      expect(unreadConv!.unread).toBe(1);

      // Buyer reads again.
      await adminRequest.get(`/api/chat/messages/${TEST_CONVERSATION_ID}`);
      unreadConv = await fetchConversation(adminRequest, TEST_CONVERSATION_ID);

      // BUG: unread is 0. The buyer's UI shows no badge even though the
      // artist sent a message the buyer hasn't "really" read — the buyer
      // only cleared the global counter.
      expect(unreadConv!.unread).toBe(0);

      // =================================================================
      // Cleanup: remove test messages so the seed stays clean
      // =================================================================

      cleanTestMessages(TEST_CONVERSATION_ID, "hello from admin");
      cleanTestMessages(TEST_CONVERSATION_ID, "bug-test ");
    });
  },
);
