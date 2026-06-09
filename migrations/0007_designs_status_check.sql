-- NOTE: no explicit BEGIN/COMMIT — `wrangler d1 execute --remote --file` rejects
-- BEGIN TRANSACTION and already runs each file atomically (all-or-nothing).

-- Fix: artist listings (status 'pending') and admin/delist flows
-- ('rejected','delisted') were rejected by the original CHECK constraint on
-- designs.status, which only allowed ('available','reserved','sold','owned').
-- D1/SQLite cannot ALTER a CHECK constraint, so we rebuild the table with the
-- widened constraint. Migration 0005 attempted to cover this with a trigger,
-- but that trigger only fires BEFORE UPDATE — INSERTs of 'pending' (every new
-- listing) still hit the table-level CHECK and failed with a 500.

-- 1. New table: identical to current `designs`, with the widened status CHECK.
CREATE TABLE designs_new (
  id                 TEXT PRIMARY KEY,
  n                  TEXT NOT NULL,
  title              TEXT NOT NULL,
  artist_id          TEXT NOT NULL REFERENCES artists(id),
  style              TEXT,
  price              REAL,
  price_usd          INTEGER,
  status             TEXT NOT NULL DEFAULT 'available'
                       CHECK (status IN ('available','reserved','sold','owned','pending','rejected','delisted')),
  placement          TEXT,
  seed               INTEGER,
  token              TEXT,
  minted             TEXT,
  medium             TEXT,
  sessions           INTEGER,
  drawn              INTEGER,
  image_override_url TEXT,
  token_id           INTEGER UNIQUE,
  reserved_until     INTEGER,
  ipfs_cid           TEXT,
  selling_mode       TEXT NOT NULL DEFAULT 'one-time',
  royalty_pct        REAL,
  image_url          TEXT
);

-- 2. Copy all existing rows (explicit column list, order-independent).
INSERT INTO designs_new (
  id, n, title, artist_id, style, price, price_usd, status, placement, seed,
  token, minted, medium, sessions, drawn, image_override_url, token_id,
  reserved_until, ipfs_cid, selling_mode, royalty_pct, image_url
)
SELECT
  id, n, title, artist_id, style, price, price_usd, status, placement, seed,
  token, minted, medium, sessions, drawn, image_override_url, token_id,
  reserved_until, ipfs_cid, selling_mode, royalty_pct, image_url
FROM designs;

-- 3. Swap tables. (earnings + resale_listings FK-reference designs(id) by name,
--    so the rename keeps those references valid.)
DROP TABLE designs;
ALTER TABLE designs_new RENAME TO designs;

-- 4. Recreate indexes (PK + token_id UNIQUE auto-indexes come from the DDL above).
CREATE INDEX IF NOT EXISTS idx_designs_status    ON designs(status);
CREATE INDEX IF NOT EXISTS idx_designs_artist_id ON designs(artist_id);

-- 5. Recreate the triggers from migration 0005 (dropped with the old table).
CREATE TRIGGER IF NOT EXISTS trg_designs_status_check
BEFORE UPDATE OF status ON designs
BEGIN
  SELECT CASE
    WHEN NEW.status NOT IN ('available','reserved','sold','owned','pending','rejected','delisted')
    THEN RAISE(ABORT, 'Invalid design status')
  END;
END;

CREATE TRIGGER IF NOT EXISTS trg_designs_selling_mode_check
BEFORE INSERT ON designs
BEGIN
  SELECT CASE
    WHEN NEW.selling_mode NOT IN ('one-time','resellable')
    THEN RAISE(ABORT, 'Invalid selling_mode')
  END;
END;

CREATE TRIGGER IF NOT EXISTS trg_designs_selling_mode_lock
BEFORE UPDATE OF selling_mode ON designs
BEGIN
  SELECT CASE
    WHEN OLD.selling_mode IS NOT NULL AND NEW.selling_mode != OLD.selling_mode
    THEN RAISE(ABORT, 'selling_mode cannot be changed after creation')
  END;
END;

INSERT OR IGNORE INTO _migrations VALUES (7, strftime('%s','now'));
