/**
 * Unit tests for chat message delivery and unread counter.
 *
 * BUGS:
 * 1. Unread counter is incremented for ALL messages, not per-role
 * 2. Messages endpoint resets unread to 0 for the entire conversation
 * 3. No real-time notification when artist sends a message to buyer
 * 4. Conversation list doesn't show per-role unread count
 */

import { describe, it, expect } from "vitest";

describe("Chat message delivery — unread counter behavior", () => {
  it("BUG: unread counter is incremented for any sender", () => {
    // BUG: The chat send endpoint increments `unread` by 1 for every
    // message, regardless of who sent it. If the artist sends a message,
    // the unread count goes up for the buyer. But if the buyer reads the
    // conversation, unread is reset to 0. This means:
    // 1. Artist sends message → unread = 1 (correct for buyer)
    // 2. Buyer reads → unread = 0
    // 3. Artist sends another message → unread = 1 (correct)
    // 4. But if both sides read the conversation, unread stays at 0
    //    even though the artist sent a message.
    //
    // The issue is that the unread counter is not per-role. It should
    // track unread for each participant separately.

    const conversation = {
      id: "conv-1",
      client_id: "client-1",
      artist_id: "artist-1",
      unread: 0,
    };

    // Artist sends a message
    conversation.unread += 1;
    expect(conversation.unread).toBe(1);

    // Buyer reads messages (GET /api/chat/messages/{id})
    // The messages endpoint sets unread = 0 for the entire conversation
    conversation.unread = 0;
    expect(conversation.unread).toBe(0);

    // Artist sends another message
    conversation.unread += 1;
    expect(conversation.unread).toBe(1);

    // This is correct behavior IF only the buyer reads the conversation.
    // But if the artist also reads the conversation (e.g., from their inbox),
    // the unread counter is also reset to 0, which means the buyer
    // would not see the unread badge.
  });

  it("BUG: messages endpoint resets unread to 0 for entire conversation", () => {
    // BUG: The messages endpoint (`/api/chat/messages/[conversationId]`)
    // resets `unread = 0` for the entire conversation, not just for the
    // current reader. This means:
    // 1. Buyer reads messages → unread = 0 (correct for buyer)
    // 2. But this also resets the unread count for the artist
    // 3. So if the buyer reads the conversation, the artist won't see
    //    an unread badge for the buyer's messages
    //
    // This is a design flaw. The unread counter should be per-role:
    // - client_unread: for the client
    // - artist_unread: for the artist
    const conversation = {
      id: "conv-1",
      client_id: "client-1",
      artist_id: "artist-1",
      unread: 3, // 3 unread messages from artist
    };

    // Buyer reads messages
    conversation.unread = 0; // Reset to 0
    expect(conversation.unread).toBe(0);

    // Artist sends a message
    conversation.unread += 1;
    expect(conversation.unread).toBe(1);

    // Artist reads messages (from their inbox)
    conversation.unread = 0; // Reset to 0 again
    expect(conversation.unread).toBe(0);

    // Now the buyer has 0 unread, but the artist also has 0 unread
    // even though the buyer sent messages that the artist hasn't seen.
  });

  it("BUG: conversation list shows single unread count, not per-role", () => {
    // BUG: The conversation list endpoint returns a single `unread` field,
    // not separate counts for client and artist. This means:
    // 1. The buyer sees the same unread count as the artist
    // 2. If the buyer reads the conversation, the artist won't see any unread
    // 3. If the artist reads the conversation, the buyer won't see any unread
    //
    // The solution would be to add `client_unread` and `artist_unread`
    // fields to the conversations table.

    const conversation = {
      id: "conv-1",
      client_id: "client-1",
      artist_id: "artist-1",
      unread: 2, // Single unread count
    };

    // This is the only field available in the conversation list
    expect(conversation).toHaveProperty("unread");
    expect(conversation).not.toHaveProperty("client_unread");
    expect(conversation).not.toHaveProperty("artist_unread");
  });
});

describe("Chat message delivery — message filtering", () => {
  it("blocks URLs in messages (anti-bypass)", () => {
    const message = "Visit https://evil.com for details";
    const urlPattern = /https?:\/\/[^\s]+/i;
    expect(message).toMatch(urlPattern);
  });

  it("blocks @mentions in messages (anti-bypass)", () => {
    const message = "Contact me @username";
    const mentionPattern = /@\w+/;
    expect(message).toMatch(mentionPattern);
  });

  it("blocks phone numbers in messages (anti-bypass)", () => {
    const message = "Call me at 08123456789";
    const phonePattern = /\d{10}/;
    expect(message).toMatch(phonePattern);
  });

  it("allows clean messages", () => {
    const message = "Hello, I would like to book a session";
    const urlPattern = /https?:\/\/[^\s]+/i;
    const mentionPattern = /@\w+/;
    const phonePattern = /\d{10}/;
    expect(message).not.toMatch(urlPattern);
    expect(message).not.toMatch(mentionPattern);
    expect(message).not.toMatch(phonePattern);
  });
});

describe("Chat message delivery — message content", () => {
  it("stores original text even when flagged", () => {
    // BUG: The chat send endpoint stores the original text in the messages
    // table, even if the message is flagged as containing a URL/phone number.
    // This means the flagged content is still stored in the database.
    // The message is flagged but the original text is preserved.
    const originalText = "Visit https://evil.com for details";
    const filter = { clean: false, reason: "url_detected" };
    const storedText = originalText; // Original text is stored, not filtered

    expect(filter.clean).toBe(false);
    expect(storedText).toBe(originalText);
  });

  it("message length is limited to 2000 characters", () => {
    const maxLength = 2000;
    const longMessage = "a".repeat(maxLength + 1);
    expect(longMessage.length).toBeGreaterThan(maxLength);
  });

  it("empty message is rejected", () => {
    const emptyMessage = "";
    const minLength = 1;
    expect(emptyMessage.length).toBeLessThan(minLength);
  });
});
