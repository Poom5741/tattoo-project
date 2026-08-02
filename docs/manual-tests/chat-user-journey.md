# Manual User-Journey Test — Chat Feature

**Covers:** client → artist chat flow, artist inbox, admin moderation  
**Backend tickets implemented:** #60 (D1 migration), #61 (send/list messages), #62 (conversations API)  
**Frontend wiring ticket:** [#63](https://github.com/poom5741/tattoo-project/issues/63) — **OPEN**

> ⚠️ **Current state (read this first):** The backend APIs and database are ready, but the frontend components are still using mock data and local state. You can navigate the UI shell today, but messages will not persist or reach the backend until Issue #63 is merged. This document marks every step with its current status so you know what to expect.

---

## 1. Preconditions

1. Repo on `main` after merge of `sandcastle/issue-62`.
2. `pnpm install` (or `bun install`) done.
3. Local D1 migration applied:

   ```bash
   npx wrangler d1 execute inknoir-catalog --local --file=migrations/0010_chat.sql
   ```

4. Local dev server running:

   ```bash
   pnpm dev
   ```

5. Seed data applied so test artists exist:

   ```bash
   npx wrangler d1 execute inknoir-catalog --local --file=migrations/0002_seed.sql
   ```

---

## 2. Test Data Setup (required for realistic journeys)

Run this SQL against your local D1 database:

```bash
npx wrangler d1 execute inknoir-catalog --local --file=scripts/chat-user-journey-data.sql
```

Save the file as `scripts/chat-user-journey-data.sql`:

```sql
BEGIN;

-- Give two seed artists wallet addresses so they can log in as artists
UPDATE artists SET wallet_address = '0x0000000000000000000000000000000000000001' WHERE id = 'mara';
UPDATE artists SET wallet_address = '0x0000000000000000000000000000000000000002' WHERE id = 'koto';

-- Pre-seed a conversation between client "test_client_1" and artist "mara"
INSERT OR IGNORE INTO conversations
  (id, client_id, artist_id, design_id, last_message, last_message_at, unread, status, created_at)
VALUES
  ('conv_demo', 'test_client_1', 'mara', 'd1', 'Hi, I love this design. Is it still available?', strftime('%s','now') - 60, 1, 'active', strftime('%s','now') - 3600);

-- Add a message in that conversation
INSERT OR IGNORE INTO messages
  (id, conversation_id, sender_id, sender_role, text, flagged, flag_reason, created_at)
VALUES
  ('msg_demo_1', 'conv_demo', 'test_client_1', 'client', 'Hi, I love this design. Is it still available?', 0, NULL, strftime('%s','now') - 60);

-- Add a flagged conversation for admin review testing
INSERT OR IGNORE INTO conversations
  (id, client_id, artist_id, design_id, last_message, last_message_at, unread, status, created_at)
VALUES
  ('conv_flagged', 'test_client_2', 'koto', 'd2', 'Contact me on whatsapp +66123456789', strftime('%s','now') - 30, 1, 'flagged', strftime('%s','now') - 1800);

INSERT OR IGNORE INTO messages
  (id, conversation_id, sender_id, sender_role, text, flagged, flag_reason, created_at)
VALUES
  ('msg_flagged_1', 'conv_flagged', 'test_client_2', 'client', 'Contact me on whatsapp +66123456789', 1, 'Pattern matched: \\d{9,}', strftime('%s','now') - 30);

COMMIT;
```

### Verify setup

```bash
npx wrangler d1 execute inknoir-catalog --local --command "SELECT id, client_id, artist_id, status, last_message FROM conversations"
```

Expected: 2 rows (`conv_demo` active, `conv_flagged` flagged).

---

## 3. Role: Client

### Journey 3.1 — Start a chat from a design page

| Step | Action | URL / Location | Expected result | Status |
| ------ | -------- | ---------------- | ----------------- | -------- |
| 1 | Sign in as a client | `/auth/login` or UI sign-in | User is authenticated; Better Auth session cookie is set | ✅ Works (Google OAuth / passkey) |
| 2 | Open a design detail page | `/design/d1` | Design page loads with artist info | ✅ Works |
| 3 | Click **"Message artist"** or **"Chat"** button | On design page | Chat panel or modal opens with artist `mara` | ❌ **Not implemented** — there is no client chat trigger in the UI yet |
| 4 | Type a message and send | Chat input | Message appears in chat, optimistic update, API call to `POST /api/chat/send` | ❌ **Blocked by #63** |
| 5 | Receive artist reply | Same chat | Reply appears in real time (or on refresh) | ❌ **Blocked by #63** |

### Journey 3.2 — View conversation list as a client

| Step | Action | URL / Location | Expected result | Status |
| ------ | -------- | ---------------- | ----------------- | -------- |
| 1 | Navigate to client inbox / messages page | `/inbox` or `/messages` | List of client's conversations ordered by most recent | ❌ **Not implemented** — no client inbox route exists |
| 2 | Click a conversation | Inbox list | Chat detail opens, shows message history | ❌ **Blocked by #63** |
| 3 | Send a follow-up message | Chat detail | Message sent and persisted | ❌ **Blocked by #63** |

---

## 4. Role: Artist

### Journey 4.1 — Log in as an artist and open inbox

| Step | Action | URL / Location | Expected result | Status |
| ------ | -------- | ---------------- | ----------------- | -------- |
| 1 | Go to artist portal | `/artist/portal` | Wallet signature gate loads | ✅ Works |
| 2 | Sign message with wallet `0x0000…0001` (Mara) | Signature gate | Redirected to portal dashboard; `artist_token` cookie set | ✅ Works |
| 3 | Click **Inbox** link or navigate directly | `/artist/inbox` | Inbox page loads with conversation list | ⚠️ **UI shell works, but list is mock data** |
| 4 | Verify real conversations appear | `/artist/inbox` | Should see `conv_demo` (client `test_client_1`) if #63 wired | ❌ **Blocked by #63** — currently shows mock `John D.` / `Jane S.` |
| 5 | Click `conv_demo` | Inbox list | Chat box opens; should fetch real messages from `GET /api/chat/messages/conv_demo` | ❌ **Blocked by #63** — currently shows empty local state |
| 6 | Read existing client message | Chat box | Shows "Hi, I love this design. Is it still available?" | ❌ **Blocked by #63** |
| 7 | Type a reply and send | Chat input | Reply appears; API call to `POST /api/chat/send` | ❌ **Blocked by #63** — currently updates local state only |
| 8 | Refresh the page | `/artist/inbox` | Sent message should persist and still be visible | ❌ **Blocked by #63** — will be lost |

### Journey 4.2 — Artist inbox scoping (security)

| Step | Action | Expected result | Status |
| ------ | -------- | ----------------- | -------- |
| 1 | Log in as artist `koto` (`0x0000…0002`) | `/artist/portal` → sign | `artist_token` for `koto` |
| 2 | Open `/artist/inbox` | Should only see conversations where `artist_id = koto` (e.g., `conv_flagged`) | ❌ **Blocked by #63** |
| 3 | Try to open `/artist/inbox` conversation ID belonging to `mara` | Should receive 403 or not be listed | ⚠️ API enforces this; UI depends on #63 |

### Journey 4.3 — Send booking action from chat

| Step | Action | Expected result | Status |
|------|--------|-----------------|--------|
| 1 | In artist chat, click **"+ Send Booking"** | Booking request sent / modal opens | ⚠️ Button exists in `ChatBox` only for `senderRole === "artist"`, but `onSendBooking` callback is not wired |

---

## 5. Role: Admin

### Journey 5.1 — Review flagged conversations

| Step | Action | URL / Location | Expected result | Status |
| ------ | -------- | ---------------- | ----------------- | -------- |
| 1 | Go to admin login | `/admin` | Admin login form loads | ✅ Works |
| 2 | Enter admin password | Login form | Authenticated; `admin_token` cookie set | ✅ Works |
| 3 | Navigate to moderation / review page | `/admin/review` (intended) | Flagged conversations list loads | ❌ **Not implemented** — `AdminReviewPanel` component exists but has no page route |
| 4 | See `conv_flagged` in list | Review page | Shows client `test_client_2` vs artist `koto`, reason "Phone number detected" | ❌ **Blocked by #63 + needs route** |
| 5 | Open the flagged conversation | Review list | Chat history loads with flagged message | ❌ **Blocked by #63** |
| 6 | Click **"Resolve & Unflag"** | Chat detail | Conversation status changes to `active` | ❌ **Blocked by #63** |
| 7 | Click **"Block User"** | Chat detail | User blocked (specific behavior TBD) | ❌ **Not implemented** |

---

## 6. Cross-Cutting Checks

### 6.1 Message content filtering

| Input | Expected behavior | Status |
| ------- | ------------------- | -------- |
| Message with URL: `visit https://example.com` | Flagged; not sent (or sent but flagged) | ⚠️ API handles it; UI still checks locally but will be removed in #63 |
| Message with phone: `call me 0812345678` | Flagged; reason "Phone number detected" | ⚠️ API handles it |
| Message with social handle: `my instagram @artist` | Flagged | ⚠️ API handles it |
| Normal message: `What time works for you?` | Sent normally | ❌ UI only until #63 |

### 6.2 Unread badge

| Scenario | Expected | Status |
| ---------- | ---------- | -------- |
| Client sends new message | Conversation `unread` increments for artist | ❌ **Blocked by #63** |
| Artist opens conversation | `unread` resets to 0 | ❌ **Blocked by #63** |
| Inbox list shows unread count badge | Visual badge on conversation | ⚠️ UI shell supports badge, but data is mock |

### 6.3 Ordering

| Scenario | Expected | Status |
|----------|----------|--------|
| Inbox list order | Conversations sorted by `last_message_at` DESC (most recent first) | ❌ **Blocked by #63** |
| Message history order | Messages sorted by `created_at` ASC (oldest first) | ⚠️ API returns ASC; UI depends on #63 |

---

## 7. Known Gaps Before #63 Is Done

1. **No client chat entry point** — There is no "Message artist" button on design pages and no client inbox route.
2. **Artist inbox uses mocks** — `InboxView.tsx` renders hard-coded `MOCK_CONVERSATIONS`.
3. **ChatBox does not call APIs** — `handleSend` only updates local React Context; messages disappear on refresh.
4. **Admin review page is missing** — `AdminReviewPanel.tsx` is not imported by any Astro page.
5. **Booking action in chat is not wired** — `onSendBooking` prop is never passed.
6. **Real-time delivery is not implemented** — No polling, SSE, or WebSocket for new messages.

---

## 8. What You Can Test Today

Until Issue #63 is merged, the only chat-related UI you can manually navigate is the **artist inbox shell**:

1. Log in as an artist at `/artist/portal`.
2. Navigate to `/artist/inbox`.
3. Observe the layout: conversation list on the left, chat area on the right.
4. Click a mock conversation.
5. Type and send a message — it will appear locally but **will not persist**.
6. Refresh — the message disappears.

Use this to validate the visual layout, responsive behavior, and accessibility of the chat components only.

---

## 9. Sign-off Checklist (to be completed after #63)

- [ ] Client can open chat from a design page.
- [ ] Client can send a message and it persists after refresh.
- [ ] Artist can log in and see real conversations in `/artist/inbox`.
- [ ] Artist inbox only shows conversations for the logged-in artist.
- [ ] Artist can reply, and the reply persists after refresh.
- [ ] Unread badge updates when a new message arrives.
- [ ] Conversations are sorted by most recent message.
- [ ] Admin can navigate to a review page and see flagged conversations.
- [ ] Admin can open a flagged conversation and view message history.
- [ ] Admin can resolve/unflag a conversation.
- [ ] Flagged content (URLs, phone numbers, social handles) is correctly flagged.
