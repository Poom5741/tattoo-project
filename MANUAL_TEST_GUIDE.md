# SAKNID Tattoo Marketplace — Manual E2E QA Test Guide

## 1. Environment & Target URLs
- **Production URL**: https://inknoir.pages.dev
- **Local Dev (Alternative)**: http://localhost:4321 (`pnpm dev`)

---

## 2. Dev Role Switcher (for testing Scenarios C & D)

The app includes a dev-only role switcher that bypasses real auth. Use it to test artist and admin flows without setting up passkey wallets or admin passwords.

### How to switch roles

Open browser DevTools → Console, then run:

```js
// Switch to Buyer (default — no auth required)
document.cookie = 'dev_role=buyer;path=/';

// Switch to Artist (accesses Mara Vael's portal & inbox)
document.cookie = 'dev_role=artist;path=/';

// Switch to Admin (accesses admin dashboard + artist inbox)
document.cookie = 'dev_role=admin;path=/';
```

**Refresh the page** after setting the cookie. An amber role indicator will appear in the header nav showing your current role.

### What each role unlocks

| Role | Accessible pages |
|------|-----------------|
| `buyer` | `/market`, `/design/*`, `/checkout/*`, `/booking`, `/wallet` |
| `artist` | All buyer pages + `/artist/portal`, `/artist/inbox` |
| `admin` | All buyer pages + `/admin`, `/artist/portal`, `/artist/inbox` |

### How to reset

- Click the role indicator in the nav → "Reset to default"
- Or run: `document.cookie = "dev_role=;max-age=0;path=/"`

---

## 3. Test Scenarios

### Scenario A: Buyer Discovery & Booking Request
1. Open https://inknoir.pages.dev in desktop browser.
2. Click **Gallery** in the header navigation → assert URL `/market`.
3. Filter by style (e.g. `Fine Line`) → assert filtered plate cards display.
4. Click plate **Serpent in Negative** (`d1`) → assert URL `/design/d1`.
5. Verify Certificate of Authenticity section, artist bio for **Mara Vael**, and ฿1.20 price tag.
6. Click **Book Mara to ink it** → assert URL `/booking?designId=d1`.
7. Fill out the booking inquiry form:
   - **Name**: `Alice Test`
   - **Contact**: `alice@example.com`
   - **Message**: `Looking forward to getting this forearm plate inked in Berlin!`
8. Click **Send Booking Request** → assert success confirmation toast/message.

---

### Scenario B: Buyer Checkout & Payment Selection
1. Return to `/design/d1`.
2. Click **Acquire Plate** → assert URL `/checkout/d1`.
3. Verify order summary: **Serpent in Negative** · ฿1.20.
4. Select payment method: **QR PromptPay** or **Credit/Debit Card**.
5. Enter email `buyer@example.com` and check terms checkbox.
6. Click **Pay ฿1.20** → verify response/sandbox redirect trigger.
   > Note: ChillPay not configured yet. Expect 503 "Payment gateway not yet configured" error.

---

### Scenario C: Artist Portal & Inbox (using Dev Role Switcher)

**Setup:**
1. Open DevTools Console → run `document.cookie = "dev_role=artist;path=/"`
2. Refresh the page.

**Test steps:**
3. Navigate to `/artist/portal` → verify Mara Vael's portal loads with plate list, bookings, and earnings.
4. Navigate to `/artist/inbox` → verify inbox loads (no redirect to portal).
5. Verify conversation `conv-test-001` appears with initial messages between client and Mara Vael.
6. Type a message in `ChatBox`: `Thank you! See you at the Berlin studio.`
7. Click **Send** → verify message appears in the chat thread.
8. Click **+ List new design** → verify the new design form appears.

**Reset:** Run `document.cookie = "dev_role=;max-age=0;path=/"` in Console.

---

### Scenario D: Admin Dashboard & Design Approval (using Dev Role Switcher)

**Setup:**
1. Open DevTools Console → run `document.cookie = "dev_role=admin;path=/"`
2. Refresh the page.

**Test steps:**
3. Navigate to `/admin` → verify Admin Dashboard loads (no password prompt).
4. Check **stats bar** → verify Bookings, Pending review, Available, Reserved, Sold counts.
5. Check **Pending design review** section:
   - Review pending submissions.
   - Click **Approve** on a pending plate → verify item updates to `available`.
6. Check **All plates** inventory table → verify all designs listed with correct statuses.
7. Check **Booking inquiries** table → verify inquiries listed.
8. Check **Artist wallet addresses** table → verify artists listed with wallet update forms.
9. Navigate to `/artist/inbox` → verify admin can access artist inbox.
10. Click **Sign out** → verify redirect back to login (dev role cookie persists, re-login not needed).

**Reset:** Run `document.cookie = "dev_role=;max-age=0;path=/"` in Console.

---

### Scenario E: i18n & Rebrand Verification
1. Open home page `/`.
2. Click **TH** in the language switcher (header) → verify page reloads with `<html lang="th" data-locale="th">`.
3. Verify hero kicker, headline, and navigation links switch to Thai strings (`แกลเลอรี`, `ศิลปิน`, `จอง`, etc.).
4. Click **EN** to switch back → verify English strings restore.
5. Check footer branding on every page → verify brand renders as **SAKNID** (not SUKNID).

---

## 4. Quick Reference

### Role switcher commands (paste in DevTools Console)

```js
// Set role
document.cookie = 'dev_role=buyer;path=/';
document.cookie = 'dev_role=artist;path=/';
document.cookie = 'dev_role=admin;path=/';

// Clear role
document.cookie = 'dev_role=;max-age=0;path=/';
```

### Key test data

| Design ID | Title | Artist | Status | Price |
|-----------|-------|--------|--------|-------|
| d1 | Serpent in Negative | Mara Vael | available | ฿1.20 |
| d2 | Koi Ascending | Koto Arai | available | ฿2.80 |
| d4 | Etched Moth | Vera Lindqvist | reserved | ฿2.10 |
| d7 | Wildflower Study | Mara Vael | sold | ฿0.90 |

| Artist ID | Name | City |
|-----------|------|------|
| mara | Mara Vael | Berlin, DE |
| koto | Koto Arai | Osaka, JP |
| sol | Sol Reyes | Mexico City, MX |
| vera | Vera Lindqvist | Stockholm, SE |
