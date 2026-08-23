/**
 * Setup test data for manual bug testing.
 *
 * This script creates test data that demonstrates the bugs found by the test suite.
 * Run this before manual testing to have reproducible test cases.
 *
 * Usage: `tsx scripts/setup-bug-test-data.ts`
 */

import { DatabaseSync } from "node:sqlite";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

function findD1Paths(): string[] {
  const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
  if (!existsSync(d1Dir)) {
    console.error("❌ D1 database not found. Run `pnpm dev` first, then `pnpm db:seed:dev`");
    process.exit(1);
  }
  const files = readdirSync(d1Dir)
    .filter((f) => f.endsWith(".sqlite") && !f.endsWith("-wal") && !f.endsWith("-shm"))
    .map((f) => ({ f, mtime: statSync(join(d1Dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return files.map((file) => join(d1Dir, file.f));
}

function setupBugTestData() {
  const dbPaths = findD1Paths();
  console.log(`\n🔧 Setting up bug test data in ${dbPaths.length} database(s)...\n`);

  for (const dbPath of dbPaths) {
    const con = new DatabaseSync(dbPath);
    try {
      console.log(`📦 Database: ${dbPath}`);

      // BUG 1: Create a booking with past appointment date (to test date validation bug)
      console.log("  ✓ Creating booking with past appointment date...");
      const pastTimestamp = Math.floor(Date.now() / 1000) - 86400; // yesterday
      con
        .prepare(
          `INSERT OR IGNORE INTO booking_inquiries (artist_id, name, contact, message, booking_type, status, appointment_date, created_at)
           VALUES ('mara', 'Bug Test - Past Date', 'past-date@test.com', 'Test booking with past date', 'plate', 'accepted', ${pastTimestamp}, ${Math.floor(Date.now() / 1000)})`
        )
        .run();

      // BUG 2: Create a reserved design with future reserved_until (to test timestamp bug)
      console.log("  ✓ Creating reserved design with future timestamp...");
      const futureSeconds = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      con
        .prepare(
          `INSERT OR IGNORE INTO designs (id, n, title, artist_id, style, price, status, placement, seed, reserved_until)
           VALUES ('bug-test-reserved', '999', 'Bug Test Reserved Design', 'mara', 'Fine Line', 5000, 'reserved', 'forearm', 12345, ${futureSeconds})`
        )
        .run();

      // BUG 3: Create a sold design that should NOT appear as available
      console.log("  ✓ Creating sold design...");
      con
        .prepare(
          `INSERT OR IGNORE INTO designs (id, n, title, artist_id, style, price, status, placement, seed)
           VALUES ('bug-test-sold', '998', 'Bug Test Sold Design', 'mara', 'Traditional', 8000, 'sold', 'back', 67890)`
        )
        .run();

      // BUG 4: Create a conversation with messages (to test chat unread counter bug)
      console.log("  ✓ Creating test conversation with messages...");
      const convId = "bug-test-conversation";
      const now = Math.floor(Date.now() / 1000);
      con
        .prepare(
          `INSERT OR IGNORE INTO conversations (id, client_id, artist_id, design_id, last_message, last_message_at, unread, status, created_at)
           VALUES ('${convId}', 'test-client-bug', 'mara', NULL, 'Test message for bug testing', ${now}, 3, 'active', ${now})`
        )
        .run();

      // Add some messages
      const messages = [
        { sender: "client", text: "Hello, I'm interested in this design", role: "client" },
        { sender: "artist", text: "Hi! Thanks for your interest", role: "artist" },
        { sender: "client", text: "Can we schedule a session?", role: "client" },
      ];

      for (const msg of messages) {
        const msgId = `msg-${convId}-${msg.role}-${Date.now()}`;
        const senderId = msg.sender === "client" ? "test-client-bug" : "mara";
        con
          .prepare(
            `INSERT OR IGNORE INTO messages (id, conversation_id, sender_id, sender_role, text, created_at)
             VALUES ('${msgId}', '${convId}', '${senderId}', '${msg.role}', '${msg.text}', ${now})`
          )
          .run();
      }

      console.log("  ✓ Test data created successfully\n");
    } catch (err) {
      console.error(`  ❌ Error setting up test data: ${err}`);
    } finally {
      con.close();
    }
  }

  console.log("✅ Bug test data setup complete!\n");
  console.log("📋 Manual Testing Guide:");
  console.log("─".repeat(80));
  console.log("\n1️⃣  BOOKING DATE VALIDATION BUG:");
  console.log("   - Go to /admin and login (password: $ADMIN_PASSWORD from .dev.vars)");
  console.log("   - Check booking inquiries table");
  console.log("   - Find 'Bug Test - Past Date' booking");
  console.log("   - It has appointment_date = yesterday (should be rejected but isn't)");
  console.log("   - Try accepting a booking with a past date via API:");
  console.log("     PUT /api/bookings/{id}/accept");
  console.log("     Body: { appointmentDate: 1577836800 } (Jan 1, 2020)");
  console.log("   - Expected: 400 error");
  console.log("   - Actual: 200 success (BUG!)\n");

  console.log("2️⃣  RESERVED_UNTIL TIMESTAMP BUG:");
  console.log("   - Go to /design/bug-test-reserved");
  console.log("   - The design should show as 'Reserved'");
  console.log("   - But it auto-transitions to 'Available' because:");
  console.log("     - reserved_until is stored as Unix seconds");
  console.log("     - Code uses new Date(ts).getTime() which interprets as milliseconds");
  console.log("     - This makes the timestamp appear as 1970 (always expired)");
  console.log("   - Expected: Design stays 'Reserved'");
  console.log("   - Actual: Design becomes 'Available' (BUG!)\n");

  console.log("3️⃣  SOLD DESIGN STATUS BUG:");
  console.log("   - Go to /market");
  console.log("   - Look for 'Bug Test Sold Design'");
  console.log("   - It should NOT appear in available listings");
  console.log("   - Or if it appears, it should show 'Claimed' badge");
  console.log("   - Go to /design/bug-test-sold");
  console.log("   - Expected: Disabled button, no 'Acquire' CTA");
  console.log("   - Check if the status badge shows correctly\n");

  console.log("4️⃣  CHAT UNREAD COUNTER BUG:");
  console.log("   - Go to /inbox (buyer inbox)");
  console.log("   - Login with test wallet or use dev_role=buyer cookie");
  console.log("   - Find conversation 'bug-test-conversation'");
  console.log("   - It shows unread=3");
  console.log("   - Click to read messages");
  console.log("   - Unread resets to 0 for ENTIRE conversation");
  console.log("   - Now artist sends a message");
  console.log("   - Unread becomes 1 again");
  console.log("   - Problem: No per-role tracking, both sides see same count\n");

  console.log("5️⃣  RESPONSIVE DESIGN BUG:");
  console.log("   - Open browser DevTools (F12)");
  console.log("   - Set viewport to 375x812 (iPhone SE)");
  console.log("   - Go to /design/d1");
  console.log("   - The image takes full width, no zoom functionality");
  console.log("   - Try to pinch-zoom the image");
  console.log("   - Expected: Zoom in/out");
  console.log("   - Actual: No zoom, image is clipped with overflow:hidden\n");

  console.log("6️⃣  BUYER DASHBOARD BUG:");
  console.log("   - Go to /wallet");
  console.log("   - This page only shows owned plates");
  console.log("   - There's NO section showing booking accept details");
  console.log("   - Missing: appointment date, artist name, design title");
  console.log("   - Go to /inbox");
  console.log("   - Shows conversations but not booking status\n");

  console.log("7️⃣  PASSKEY AUTH BUG:");
  console.log("   - Go to /auth/login");
  console.log("   - Should show passkey options (Gmail, device, etc.)");
  console.log("   - Currently only shows Google OAuth");
  console.log("   - Missing: Passkey provider selector UI\n");

  console.log("8️⃣  ARTIST PROFILE IMAGE BUG:");
  console.log("   - Go to /artist/portal");
  console.log("   - Login as artist (use dev_role=artist cookie)");
  console.log("   - Look for profile image upload");
  console.log("   - There's NO endpoint for uploading profile images");
  console.log("   - Artist profiles use Plate component (generative art from seed)");
  console.log("   - Missing: Real photo upload functionality\n");

  console.log("9️⃣  DESIGN EDIT BUG:");
  console.log("   - Go to /artist/portal");
  console.log("   - Try to edit an available design");
  console.log("   - Only rejected designs can be edited");
  console.log("   - Try editing available design via API:");
  console.log("     PUT /api/designs/{id}/edit");
  console.log("     Body: { title: 'New Title' }");
  console.log("   - Expected: 200 success");
  console.log("   - Actual: 422 'Only rejected designs can be edited' (BUG!)\n");

  console.log("─".repeat(80));
  console.log("\n🚀 Dev server should be running at: http://localhost:4321");
  console.log("📝 Admin password: see ADMIN_PASSWORD in .dev.vars");
  console.log("🔧 Run tests: pnpm test:e2e -- tests/e2e/bugs/\n");
}

setupBugTestData();
