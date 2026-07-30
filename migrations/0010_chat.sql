-- Migration: Create chat tables (conversations + messages)
-- For in-app messaging between clients and artists

BEGIN;

CREATE TABLE IF NOT EXISTS conversations (
  id            TEXT PRIMARY KEY,
  client_id     TEXT NOT NULL,
  artist_id     TEXT NOT NULL REFERENCES artists(id),
  design_id     TEXT,
  last_message  TEXT,
  last_message_at INTEGER,
  unread        INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'flagged')),
  created_at    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_artist_id ON conversations(artist_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL,
  sender_role     TEXT NOT NULL CHECK (sender_role IN ('client', 'artist', 'admin')),
  text            TEXT NOT NULL CHECK (length(text) BETWEEN 1 AND 2000),
  booking_id      TEXT,
  booking_action  TEXT CHECK (booking_action IN ('request', 'confirm', 'decline') OR booking_action IS NULL),
  flagged         INTEGER NOT NULL DEFAULT 0,
  flag_reason     TEXT,
  created_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_flagged ON messages(flagged);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at ON messages(conversation_id, created_at);

INSERT OR IGNORE INTO _migrations VALUES (10, strftime('%s','now'));

COMMIT;
