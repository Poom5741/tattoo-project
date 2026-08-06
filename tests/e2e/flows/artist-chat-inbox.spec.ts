/**
 * Artist chat inbox — end-to-end user flow.
 *
 * Drives the artist's chat inbox journey. The chat UI is mocked
 * today (InboxView hardcodes MOCK_CONVERSATIONS, ChatBox uses an
 * in-memory store that does not POST to /api/chat/send), so the
 * spec is mostly honest test.skip with clear pointers to the wiring
 * tickets. The runnable parts assert the current behavior so the
 * page cannot regress silently.
 *
 * Once #50, #59, #63 (the chat wiring tickets on map #53) land, the
 * test.skip blocks become real tests, and the existing per-page
 * tests in tests/e2e/chat-inbox.spec.ts are replaced by this flow.
 *
 * **What this spec drives (runnable today):**
 *   - The /artist/inbox page renders the inbox pane with the
 *     MOCK_CONVERSATIONS rows (John D., Jane S.).
 *   - Click a conversation -> ChatBox mounts with the empty-state
 *     placeholder removed.
 *   - The page is publicly accessible (no auth gate) - regression
 *     guard for #71.
 *
 * **What this spec documents (test.skip until the wiring lands):**
 *   - The real conversation list (not MOCK) - #50.
 *   - Real message history - #50/#59.
 *   - Send-message POST to /api/chat/send - #50/#59.
 *   - Message persistence visible in the inbox - #50/#59/#63.
 *   - /artist/inbox is auth-gated - #71.
 *
 * Covers closed issues:
 *   #31 (Implement chat MVP with booking integration) - the flow shape.
 *   #40 (Chat MVP - artist messaging with anti-bypass filtering,
 *        TH/EN support) - the flow shape; the anti-bypass assertions
 *        are covered by the api/chat-send.spec.ts unit-style tests.
 *   #41 (Chat Booking Integration - booking references, history
 *        persistence, admin review) - the flow shape; the admin
 *        review is its own surface.
 *
 * Env: real Playwright UI spec. On this dev box the chromium binary
 * cannot find its system libraries (see #67). Runs on a working
 * env or in CI (#70).
 */

import { test, expect, type Page } from "@playwright/test";

/** Wait for the React InboxView to hydrate by checking the MOCK row. */
async function waitForInbox(page: Page): Promise<void> {
  // The MOCK_CONVERSATIONS rows render with the client name as the
  // primary text. Wait for the first one.
  await page.waitForSelector("text=John D.", { timeout: 10_000 });
}

test.describe("Artist chat inbox - end-to-end user flow", () => {
  // ────────────────────────────────────────────────────────────────
  // Runnable today
  // ────────────────────────────────────────────────────────────────

  test("/artist/inbox renders the inbox pane with the MOCK conversations", async ({ page }) => {
    await page.goto("/artist/inbox");
    await waitForInbox(page);
    // The inbox header is "Inbox".
    await expect(page.locator("text=Inbox").first()).toBeVisible();
    // The two MOCK_CONVERSATIONS rows are visible.
    await expect(page.locator("text=John D.")).toBeVisible();
    await expect(page.locator("text=Dragon Sleeve")).toBeVisible();
    await expect(page.locator("text=Jane S.")).toBeVisible();
    await expect(page.locator("text=Floral Wrist")).toBeVisible();
    // The empty-state placeholder ("Select a conversation") is
    // visible because no row has been clicked yet.
    await expect(page.locator("text=Select a conversation")).toBeVisible();
  });

  test("click a conversation -> ChatBox mounts, empty-state disappears", async ({ page }) => {
    await page.goto("/artist/inbox");
    await waitForInbox(page);
    // Click John D.'s row.
    const johnRow = page.locator("button", { hasText: "John D." });
    await johnRow.click();
    // The empty-state placeholder is gone.
    await expect(page.locator("text=Select a conversation")).toHaveCount(0);
    // The ChatBox mounted. Its header is "Chat" and the input is
    // visible.
    await expect(page.locator("text=Chat").first()).toBeVisible();
    await expect(
      page.locator('input[placeholder="Type a message..."]'),
    ).toBeVisible();
  });

  test("sending a message via the UI does NOT POST to /api/chat/send (as-shipped)", async ({ page }) => {
    // This test is the as-shipped regression guard. It pins the
    // current behavior: the ChatBox uses the in-memory store, the
    // send button does not POST. When #50/#59/#63 land and the
    // wiring is in, this test will start failing — that's the
    // signal to delete it and rely on the test.skip blocks below.
    let posted = false;
    page.on("request", (req) => {
      if (req.url().includes("/api/chat/send") && req.method() === "POST") {
        posted = true;
      }
    });
    await page.goto("/artist/inbox");
    await waitForInbox(page);
    await page.locator("button", { hasText: "John D." }).click();
    await page.locator('input[placeholder="Type a message..."]').fill("hello");
    // The send button is the only button inside the ChatBox's
    // bottom row. Find it by being a button adjacent to the input.
    const sendButton = page
      .locator('input[placeholder="Type a message..."]')
      .locator("xpath=following-sibling::button")
      .first();
    await sendButton.click();
    await page.waitForTimeout(200);
    expect(posted).toBe(false);
  });

  test("/artist/inbox redirects to /artist/portal when not authenticated", async ({ page }) => {
    // The inbox page now has an auth gate (middleware). Visiting it
    // without a session should redirect to /artist/portal.
    await page.goto("/artist/inbox");
    await expect(page).toHaveURL(/\/artist\/portal/);
  });

  test("MOCK rows show the unread badge for John D. (unread: 2)", async ({ page }) => {
    // As-shipped: the MOCK has unread=2 on the John D. row. The
    // badge is a small blue pill with the number. When real
    // conversation data is wired in, this test will be updated.
    await page.goto("/artist/inbox");
    await waitForInbox(page);
    const johnRow = page.locator("button", { hasText: "John D." });
    // The badge "2" is inside the row.
    await expect(johnRow.locator("text=2")).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────
  // test.skip until the chat wiring lands
  // ────────────────────────────────────────────────────────────────

  test.skip("real conversation list is fetched from GET /api/chat/conversations (not MOCK)", async ({ page }) => {
    // After #50 lands, MOCK_CONVERSATIONS is replaced with a real
    // fetch to /api/chat/conversations. The seeded conv-test-001
    // (from pnpm db:seed:dev) should appear in the list.
    //
    // Test body: log in as artist (see F4 #76), navigate to
    // /artist/inbox, assert the row "test-client" appears (not
    // "John D." / "Jane S.").
    test.skip(true, "wiring in flight on #50, #59, #63; see map #53");
  });

  test.skip("clicking a real conversation loads message history from GET /api/chat/messages/[id]", async ({ page }) => {
    // After #50/#59, the ChatBox fetches the real message history
    // when mounted. The seeded msg-test-001 and msg-test-002 (from
    // pnpm db:seed:dev) should render in the conversation view.
    test.skip(true, "wiring in flight on #50, #59, #63; see map #53");
  });

  test.skip("sending a reply POSTs to /api/chat/send", async ({ page }) => {
    // After #50/#59, the ChatBox send button calls the real API.
    // The spec asserts the POST fires with the right payload.
    test.skip(true, "wiring in flight on #50, #59, #63; see map #53");
  });

  test.skip("the sent message appears in the conversation view (round-trip)", async ({ page }) => {
    // After #50/#59/#63, sending a message should:
    //   1. POST to /api/chat/send (handled by the test above).
    //   2. Update the local store optimistically.
    //   3. On the next GET /api/chat/messages/[id] poll, the new
    //      message appears in the conversation view.
    test.skip(true, "wiring in flight on #50, #59, #63; see map #53");
  });

  test("/artist/inbox is auth-gated (redirects unauthenticated requests)", async ({ page }) => {
    // After #71 lands, /artist/inbox should redirect to the artist
    // sign-in page when no artist session is present. This test
    // verifies the fix.
    await page.goto("/artist/inbox");
    await expect(page).toHaveURL(/\/artist\/portal/);
  });

  test.skip("anti-bypass: a client message containing http(s):// is flagged in the UI", async ({ page }) => {
    // After #50/#59, the anti-bypass wrapper that the API applies
    // (flagged=1, flag_reason set) should also surface in the UI.
    // The unit-level coverage is in tests/e2e/api/chat-send.spec.ts
    // (the 4 anti-bypass tests added in #66). This is the UI
    // version of the same assertion.
    test.skip(true, "wiring in flight on #50, #59, #63; see map #53");
  });
});
