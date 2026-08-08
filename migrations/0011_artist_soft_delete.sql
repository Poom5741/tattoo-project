-- Add deleted_at field for soft delete of artists
ALTER TABLE artists ADD COLUMN deleted_at INTEGER;

-- Create index for filtering active artists
CREATE INDEX IF NOT EXISTS idx_artists_deleted_at ON artists(deleted_at);

INSERT OR IGNORE INTO _migrations VALUES (11, strftime('%s','now'));
