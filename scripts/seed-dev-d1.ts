#!/usr/bin/env tsx
/**
 * Seeds the local Cloudflare D1 (the one wrangler's `astro dev` uses) with the
 * migrations and a small known conversation + messages + test user. The
 * Playwright e2e tests assume the schema and at least one conversation row
 * exist; this script is the durable way to make that true on a fresh checkout.
 *
 * Use:
 *   pnpm db:seed:dev          # apply migrations + seed conversation
 *   pnpm db:seed:dev --reset  # delete the local D1 first, then re-create
 *
 * The local D1 path is fixed by wrangler:
 *   .wrangler/state/v3/d1/miniflare-D1DatabaseObject/<hash>.sqlite
 * This script finds the most recent .sqlite file under that directory.
 *
 * NOT for production. The remote D1 (database_id in wrangler.toml) is
 * managed by `wrangler d1 migrations apply` against the real Cloudflare
 * account. This script only touches the dev sandbox.
 *
 * Uses Node's built-in node:sqlite module (Node 22+, experimental). No new
 * devDeps.
 */
import { readFileSync, readdirSync, statSync, unlinkSync, existsSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const d1Dir = join(root, ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");

function findD1Path(): string {
  if (!existsSync(d1Dir)) {
    throw new Error(
      `Local D1 not found at ${d1Dir}. Run \`pnpm dev\` once to let wrangler create it, then re-run this script.`,
    );
  }
  const files = readdirSync(d1Dir)
    .filter((f) => f.endsWith(".sqlite") && !f.endsWith("-wal") && !f.endsWith("-shm"))
    .map((f) => ({
      f,
      mtime: statSync(join(d1Dir, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);
  if (files.length === 0) {
    throw new Error(
      `No .sqlite files in ${d1Dir}. Run \`pnpm dev\` once to let wrangler create it.`,
    );
  }
  return join(d1Dir, files[0].f);
}

function execScript(con: DatabaseSync, sql: string): void {
  // node:sqlite's exec() handles multi-statement scripts. BEGIN/COMMIT
  // inside the script would conflict with our outer transaction, so the
  // caller is responsible for stripping them.
  con.exec(sql);
}

function applyMigrations(con: DatabaseSync): void {
  const migrationsDir = join(root, "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  if (files.length === 0) {
    throw new Error(`No .sql files in ${migrationsDir}`);
  }
  for (const f of files) {
    const raw = readFileSync(join(migrationsDir, f), "utf8");
    const txt = raw
      .split("\n")
      .filter((line) => !/^\s*BEGIN\s*;\s*$/.test(line) && !/^\s*COMMIT\s*;\s*$/.test(line))
      .join("\n");
    try {
      execScript(con, txt);
    } catch (e) {
      const msg = (e as Error).message;
      // CREATE TABLE IF NOT EXISTS is idempotent; if a migration uses
      // CREATE TABLE without IF NOT EXISTS and the table already exists,
      // ignore. Likewise ALTER TABLE ADD COLUMN raises "duplicate column
      // name" if the column already exists. Both are safe to skip.
      if (
        /already exists/i.test(msg) ||
        /duplicate column name/i.test(msg)
      ) {
        console.log(`  ${f} ok (idempotent re-apply)`);
        continue;
      }
      throw new Error(`Migration ${f} failed: ${msg}`);
    }
    console.log(`  ${f} ok`);
  }
}

function seedTestConversation(con: DatabaseSync): void {
  const now = Math.floor(Date.now() / 1000);
  // Known conversation id used by tests/e2e/api/chat-*.spec.ts and
  // tests/e2e/chat-inbox.spec.ts. The client_id / artist_id / design_id
  // are stable strings so the tests can assert them.
  con
    .prepare(
      `INSERT OR REPLACE INTO conversations
        (id, client_id, artist_id, design_id, last_message, last_message_at, unread, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      "conv-test-001",
      "test-client",
      "mara",
      "d1",
      "hello there",
      now,
      0,
      "active",
      now - 3600,
    );
  // Two messages, ascending by created_at, so the order assertion has
  // something to assert against.
  con
    .prepare(
      `INSERT OR REPLACE INTO messages
        (id, conversation_id, sender_id, sender_role, text, booking_id, booking_action, flagged, flag_reason, created_at)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, 0, NULL, ?)`,
    )
    .run("msg-test-001", "conv-test-001", "test-client", "client", "first message", now - 1800);
  con
    .prepare(
      `INSERT OR REPLACE INTO messages
        (id, conversation_id, sender_id, sender_role, text, booking_id, booking_action, flagged, flag_reason, created_at)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, 0, NULL, ?)`,
    )
    .run("msg-test-002", "conv-test-001", "mara", "artist", "reply message", now - 1700);
  console.log("  seeded conv-test-001 (client=test-client, artist=mara) + 2 messages");
}

function main(): void {
  const reset = process.argv.includes("--reset");
  const dbPath = findD1Path();
  console.log(`Local D1: ${dbPath}`);

  if (reset) {
    console.log("--reset: deleting and recreating the D1 file");
    unlinkSync(dbPath);
    for (const ext of ["-wal", "-shm"]) {
      const p = dbPath + ext;
      if (existsSync(p)) unlinkSync(p);
    }
  }

  const con = new DatabaseSync(dbPath);
  con.exec("PRAGMA journal_mode = WAL");
  con.exec("PRAGMA foreign_keys = ON");
  try {
    console.log("Applying migrations:");
    con.exec("BEGIN");
    try {
      applyMigrations(con);
      con.exec("COMMIT");
    } catch (e) {
      con.exec("ROLLBACK");
      throw e;
    }
    console.log("Seeding test conversation:");
    seedTestConversation(con);
    // Verify
    const tables = con
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    console.log(`Tables: ${tables.map((t) => t.name).join(", ")}`);
    const conv = con
      .prepare("SELECT id, client_id, artist_id, status FROM conversations")
      .all() as { id: string; client_id: string; artist_id: string; status: string }[];
    console.log(`Conversations: ${conv.length} row(s) - ${conv.map((c) => c.id).join(", ")}`);
    const msgs = con.prepare("SELECT COUNT(*) as n FROM messages").get() as { n: number };
    console.log(`Messages: ${msgs.n} row(s)`);
  } finally {
    con.close();
  }
  console.log("Done.");
}

main();
