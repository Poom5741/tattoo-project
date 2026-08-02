# Manual Test Case — Issue #62: Chat Artist Inbox & Conversations API

**Ticket:** [#62](https://github.com/poom5741/tattoo-project/issues/62)  
**Merged:** `9f48392` (`sandcastle/issue-62`)  
**Scope:** `GET /api/chat/conversations` and `GET /api/chat/conversations/[id]`  
**Goal:** Verify that clients, artists, and admins can each list and fetch conversations according to their role.

---

## 1. Preconditions

1. Repo is on `main` after merge of `sandcastle/issue-62`.
2. Dependencies installed: `pnpm install` (or `bun install`).
3. Local D1 migration applied:

   ```bash
   npx wrangler d1 execute inknoir-catalog --local --file=migrations/0010_chat.sql
   ```

   > If your local database name differs, run `npx wrangler d1 list` and substitute it.
4. Local dev server running:

   ```bash
   pnpm dev
   ```

   Default URL: `http://localhost:4321`.
5. Seed data applied (`migrations/0002_seed.sql`) so test artists exist.

---

## 2. Test Data Setup

Save this as `scripts/issue-62-test-data.sql`, edit the placeholder `client_id` values if you already have real Better Auth user IDs, then run:

```bash
npx wrangler d1 execute inknoir-catalog --local --file=scripts/issue-62-test-data.sql
```

```sql
-- Test data for Issue #62 manual QA
BEGIN;

-- Update one seed artist with a known wallet address for artist-login tests
UPDATE artists SET wallet_address = '0x0000000000000000000000000000000000000001' WHERE id = 'mara';

-- Optional: a second seed artist (no wallet) to test admin filtering
UPDATE artists SET wallet_address = '0x0000000000000000000000000000000000000002' WHERE id = 'koto';

-- Test conversations
-- conv_1: client "test_client_1" with artist "mara"
INSERT OR IGNORE INTO conversations
  (id, client_id, artist_id, design_id, last_message, last_message_at, unread, status, created_at)
VALUES
  ('conv_1', 'test_client_1', 'mara', 'd1', 'Hello from client 1', strftime('%s','now') - 100, 1, 'active', strftime('%s','now') - 200);

-- conv_2: same client with artist "koto"
INSERT OR IGNORE INTO conversations
  (id, client_id, artist_id, design_id, last_message, last_message_at, unread, status, created_at)
VALUES
  ('conv_2', 'test_client_1', 'koto', 'd2', 'Hello again', strftime('%s','now') - 50, 1, 'active', strftime('%s','now') - 150);

-- conv_3: a different client with artist "mara"
INSERT OR IGNORE INTO conversations
  (id, client_id, artist_id, design_id, last_message, last_message_at, unread, status, created_at)
VALUES
  ('conv_3', 'test_client_2', 'mara', 'd11', 'Artist reply here', strftime('%s','now') - 10, 0, 'active', strftime('%s','now') - 100);

COMMIT;
```

### Expected result after setup

```bash
npx wrangler d1 execute inknoir-catalog --local --command "SELECT id, client_id, artist_id, last_message FROM conversations ORDER BY last_message_at DESC"
```

Returns 3 rows:

- `conv_3` → `test_client_2` / `mara`
- `conv_2` → `test_client_1` / `koto`
- `conv_1` → `test_client_1` / `mara`

---

## 3. Authentication Helpers

All API calls require a cookie header. Use the section matching the role you are testing.

### 3.1 Admin

```bash
curl -s -c /tmp/admin_cookies.txt -X POST http://localhost:4321/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"saknid2026"}'
```

> Use the value of `ADMIN_PASSWORD` from your environment if it overrides the default.

Use the saved cookies in subsequent calls:

```bash
alias admin_curl='curl -s -b /tmp/admin_cookies.txt'
```

### 3.2 Artist (wallet signature)

Artist login requires signing a challenge with the wallet configured above (`0x0000…0001`). If you have the private key available locally, run the helper in `scripts/issue-62-artist-login.ts` (see section 6), or use the artist portal UI and copy the `artist_token` cookie.

Shortcut for local dev (bypasses signature):

```bash
ARTIST_TOKEN="manual-test-token-mara"
# Store the session in KV
npx wrangler kv:key put --local --namespace-id <SESSION_KV_ID> "artist:${ARTIST_TOKEN}" \
  '{"artistId":"mara","walletAddress":"0x0000000000000000000000000000000000000001","name":"Mara Vael"}'
```

> Get `<SESSION_KV_ID>` from `npx wrangler kv:namespace list`.

Then use cookie `artist_token=${ARTIST_TOKEN}`.

### 3.3 Client (Better Auth)

Option A — sign in via the UI (Google OAuth / passkey), then copy the Better Auth session cookie from the browser and export it:

```bash
export CLIENT_COOKIE="better-auth.session_token=<token_from_browser>"
```

Option B — insert a synthetic session directly (useful for repeated local QA):

```sql
-- Run against local D1
INSERT OR IGNORE INTO user (id, name, email, createdAt, updatedAt)
VALUES ('test_client_1', 'Test Client', 'test-client@example.com', 1700000000000, 1700000000000);

INSERT OR IGNORE INTO session (id, userId, token, expiresAt, createdAt, updatedAt)
VALUES ('sess_test_1', 'test_client_1', 'test-session-token-123', 1899999999999, 1700000000000, 1700000000000);
```

Then use the matching cookie. Better Auth default cookie names are usually `better-auth.session_token` or `session_token`; inspect the response from the UI sign-in to confirm.

```bash
export CLIENT_COOKIE="better-auth.session_token=test-session-token-123"
```

---

## 4. Test Scenarios

### Scenario A — Admin lists all conversations

**Steps:**

```bash
admin_curl http://localhost:4321/api/chat/conversations | jq .
```

**Expected:**

- Status `200`
- `conversations` array contains `conv_1`, `conv_2`, `conv_3`
- Results are ordered by `last_message_at` descending (`conv_3`, `conv_2`, `conv_1`)

### Scenario B — Admin filters by artist

**Steps:**

```bash
admin_curl "http://localhost:4321/api/chat/conversations?artistId=mara" | jq .
```

**Expected:**

- Status `200`
- Only `conv_1` and `conv_3` returned (both belong to `mara`)
- `conv_2` is excluded

### Scenario C — Client lists only own conversations

**Steps:** (using `test_client_1` cookie)

```bash
curl -s -b "$CLIENT_COOKIE" http://localhost:4321/api/chat/conversations | jq .
```

**Expected:**

- Status `200`
- Only `conv_1` and `conv_2` returned
- `conv_3` is excluded

### Scenario D — Artist lists only own conversations

**Steps:** (using `mara` artist token cookie)

```bash
curl -s -b "artist_token=${ARTIST_TOKEN}" http://localhost:4321/api/chat/conversations | jq .
```

**Expected:**

- Status `200`
- Only `conv_1` and `conv_3` returned
- `conv_2` is excluded

### Scenario E — Fetch single conversation as participant (client)

**Steps:**

```bash
curl -s -b "$CLIENT_COOKIE" http://localhost:4321/api/chat/conversations/conv_1 | jq .
```

**Expected:**

- Status `200`
- Response includes `conversation` with `artist_name` and `artist_handle` joined from `artists`
- `conversation.artist_id == 'mara'`

### Scenario F — Fetch single conversation as participant (artist)

**Steps:**

```bash
curl -s -b "artist_token=${ARTIST_TOKEN}" http://localhost:4321/api/chat/conversations/conv_3 | jq .
```

**Expected:**

- Status `200`
- `conversation.client_id == 'test_client_2'`

### Scenario G — Non-participant gets 403

**Steps:** (use `koto` artist token to fetch `conv_1`, which belongs to `mara`)

```bash
curl -s -w "\nHTTP %{http_code}\n" -b "artist_token=${KOTO_ARTIST_TOKEN}" http://localhost:4321/api/chat/conversations/conv_1
```

**Expected:**

- Status `403`
- Body contains `{ "error": "Forbidden" }`

### Scenario H — Missing conversation returns 404

**Steps:**

```bash
curl -s -w "\nHTTP %{http_code}\n" -b "$CLIENT_COOKIE" http://localhost:4321/api/chat/conversations/does-not-exist
```

**Expected:**

- Status `404`
- Body contains `{ "error": "Not found" }`

### Scenario I — Unauthenticated request returns 401

**Steps:**

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:4321/api/chat/conversations
```

**Expected:**

- Status `401`
- Body contains `{ "error": "Unauthorized" }`

---

## 5. Cleanup

```bash
npx wrangler d1 execute inknoir-catalog --local --command "DELETE FROM conversations WHERE id IN ('conv_1','conv_2','conv_3')"
npx wrangler d1 execute inknoir-catalog --local --command "DELETE FROM messages WHERE conversation_id IN ('conv_1','conv_2','conv_3')"
```

If you inserted synthetic Better Auth sessions/users for client testing, remove those too:

```bash
npx wrangler d1 execute inknoir-catalog --local --command "DELETE FROM session WHERE id = 'sess_test_1'"
npx wrangler d1 execute inknoir-catalog --local --command "DELETE FROM user WHERE id = 'test_client_1'"
```

---

## 6. Optional: Artist Login Helper Script

If you have the private key for `0x0000…0001`, save this as `scripts/issue-62-artist-login.ts` and run it to obtain the `artist_token` cookie automatically:

```ts
import { privateKeyToAccount } from "viem/accounts";

const PRIVATE_KEY = process.env.ARTIST_TEST_PRIVATE_KEY as `0x${string}`;
const BASE = "http://localhost:4321";

async function main() {
  const challengeRes = await fetch(`${BASE}/api/auth/challenge`);
  const { message, nonce } = await challengeRes.json();
  const account = privateKeyToAccount(PRIVATE_KEY);
  const signature = await account.signMessage({ message });

  const loginRes = await fetch(`${BASE}/api/auth/artist-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: account.address, signature, nonce }),
  });

  const setCookie = loginRes.headers.getSetCookie?.() ?? loginRes.headers.get("set-cookie") ?? "";
  console.log("Status:", loginRes.status);
  console.log("Cookies:", setCookie);
}

main();
```

Run with:

```bash
ARTIST_TEST_PRIVATE_KEY=0x... pnpm tsx scripts/issue-62-artist-login.ts
```

---

## 7. Sign-off Checklist

- [ ] Admin list returns all 3 conversations in correct order.
- [ ] Admin `?artistId=mara` filter returns only that artist's conversations.
- [ ] Client list returns only conversations where `client_id` matches the signed-in user.
- [ ] Artist list returns only conversations where `artist_id` matches the signed-in artist.
- [ ] Participant can fetch a single conversation and sees `artist_name` / `artist_handle`.
- [ ] Non-participant receives `403 Forbidden`.
- [ ] Unknown conversation id returns `404 Not found`.
- [ ] Unauthenticated request returns `401 Unauthorized`.
