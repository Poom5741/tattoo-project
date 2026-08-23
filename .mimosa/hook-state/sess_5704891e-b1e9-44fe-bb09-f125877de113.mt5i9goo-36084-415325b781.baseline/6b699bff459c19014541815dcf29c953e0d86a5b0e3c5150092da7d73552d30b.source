import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migrationPath = resolve(process.cwd(), "migrations", "0010_chat.sql");
const sql = readFileSync(migrationPath, "utf-8");

describe("migration 0010_chat.sql", () => {
  it("creates conversations table with required columns and constraints", () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS conversations\s*\(/i);
    expect(sql).toMatch(/id\s+TEXT\s+PRIMARY\s+KEY/i);
    expect(sql).toMatch(/client_id\s+TEXT\s+NOT\s+NULL/i);
    expect(sql).toMatch(/artist_id\s+TEXT\s+NOT\s+NULL\s+REFERENCES\s+artists\(id\)/i);
    expect(sql).toMatch(/design_id\s+TEXT/i);
    expect(sql).toMatch(/last_message\s+TEXT/i);
    expect(sql).toMatch(/last_message_at\s+INTEGER/i);
    expect(sql).toMatch(/unread\s+INTEGER\s+NOT\s+NULL\s+DEFAULT\s+0/i);
    expect(sql).toMatch(/status\s+TEXT\s+NOT\s+NULL\s+DEFAULT\s+'active'\s+CHECK\s*\(\s*status\s+IN\s*\(\s*'active',\s*'archived',\s*'flagged'\s*\)\s*\)/i);
    expect(sql).toMatch(/created_at\s+INTEGER\s+NOT\s+NULL/i);
  });

  it("creates messages table with required columns and constraints", () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS messages\s*\(/i);
    expect(sql).toMatch(/id\s+TEXT\s+PRIMARY\s+KEY/i);
    expect(sql).toMatch(/conversation_id\s+TEXT\s+NOT\s+NULL\s+REFERENCES\s+conversations\(id\)\s+ON\s+DELETE\s+CASCADE/i);
    expect(sql).toMatch(/sender_id\s+TEXT\s+NOT\s+NULL/i);
    expect(sql).toMatch(/sender_role\s+TEXT\s+NOT\s+NULL\s+CHECK\s*\(\s*sender_role\s+IN\s*\(\s*'client',\s*'artist',\s*'admin'\s*\)\s*\)/i);
    expect(sql).toMatch(/text\s+TEXT\s+NOT\s+NULL\s+CHECK\s*\(\s*length\(text\)\s+BETWEEN\s+1\s+AND\s+2000\s*\)/i);
    expect(sql).toMatch(/booking_id\s+TEXT/i);
    expect(sql).toMatch(/booking_action\s+TEXT\s+CHECK\s*\(\s*booking_action\s+IN\s*\(\s*'request',\s*'confirm',\s*'decline'\s*\)\s+OR\s+booking_action\s+IS\s+NULL\s*\)/i);
    expect(sql).toMatch(/flagged\s+INTEGER\s+NOT\s+NULL\s+DEFAULT\s+0/i);
    expect(sql).toMatch(/flag_reason\s+TEXT/i);
    expect(sql).toMatch(/created_at\s+INTEGER\s+NOT\s+NULL/i);
  });

  it("creates all six indexes", () => {
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations\(client_id\)/i);
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS idx_conversations_artist_id ON conversations\(artist_id\)/i);
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations\(status\)/i);
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations\(last_message_at\)/i);
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages\(conversation_id\)/i);
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS idx_messages_flagged ON messages\(flagged\)/i);
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at ON messages\(conversation_id,\s*created_at\)/i);
  });

  it("registers migration version 10 in _migrations", () => {
    expect(sql).toMatch(/INSERT OR IGNORE INTO _migrations VALUES \(10,\s*strftime\('%s','now'\)\)/i);
  });
});
