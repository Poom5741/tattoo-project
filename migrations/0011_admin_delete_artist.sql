BEGIN;

-- Add soft-delete timestamp to artists table.
-- NULL means active; non-NULL means soft-deleted.
ALTER TABLE artists ADD COLUMN deleted_at INTEGER;

INSERT OR IGNORE INTO _migrations VALUES (11, strftime('%s','now'));

COMMIT;
