-- Migration: Add display-only client metadata to conversations.
-- Stores client name and contact as display metadata, separate from identity.
-- See: ticket #109 (H3+H4 booking/chat identity fix)

ALTER TABLE conversations ADD COLUMN client_name TEXT;
ALTER TABLE conversations ADD COLUMN client_contact TEXT;

INSERT OR IGNORE INTO _migrations VALUES (12, strftime('%s','now'));
