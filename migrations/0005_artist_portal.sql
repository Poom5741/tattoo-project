BEGIN;

-- D1 SQLite does not support ALTER COLUMN or modifying CHECK constraints.
-- Strategy: Add new columns with their own CHECK constraints.
-- The old status CHECK on 'designs' only covers ('available','reserved','sold','owned').
-- We cannot ALTER it. Instead, we enforce new status values at the application layer + a trigger.

-- New columns on designs
ALTER TABLE designs ADD COLUMN selling_mode TEXT NOT NULL DEFAULT 'one-time';
ALTER TABLE designs ADD COLUMN royalty_pct REAL;
ALTER TABLE designs ADD COLUMN image_url TEXT;

-- New columns on booking_inquiries (buyer_wallet already added in 0004)
ALTER TABLE booking_inquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE booking_inquiries ADD COLUMN appointment_date INTEGER;

-- Backfill existing booking_inquiries rows that may have NULL status
UPDATE booking_inquiries SET status = 'pending' WHERE status IS NULL;

-- Resale listings table
CREATE TABLE IF NOT EXISTS resale_listings (
  id TEXT PRIMARY KEY,
  design_id TEXT NOT NULL REFERENCES designs(id),
  token_id INTEGER NOT NULL,
  seller_wallet TEXT NOT NULL,
  asking_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  sold_at INTEGER,
  sold_tx_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_resale_status ON resale_listings(status);
CREATE INDEX IF NOT EXISTS idx_resale_design ON resale_listings(design_id);

-- Earnings tracking table
CREATE TABLE IF NOT EXISTS earnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id TEXT NOT NULL REFERENCES artists(id),
  design_id TEXT NOT NULL REFERENCES designs(id),
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  platform_fee REAL NOT NULL,
  tx_hash TEXT,
  payment_method TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_earnings_artist ON earnings(artist_id);

-- Application-level trigger to enforce new status values on UPDATE
CREATE TRIGGER IF NOT EXISTS trg_designs_status_check
BEFORE UPDATE OF status ON designs
BEGIN
  SELECT CASE
    WHEN NEW.status NOT IN ('available','reserved','sold','owned','pending','rejected','delisted')
    THEN RAISE(ABORT, 'Invalid design status')
  END;
END;

-- Application-level trigger to enforce selling_mode values on INSERT
CREATE TRIGGER IF NOT EXISTS trg_designs_selling_mode_check
BEFORE INSERT ON designs
BEGIN
  SELECT CASE
    WHEN NEW.selling_mode NOT IN ('one-time','resellable')
    THEN RAISE(ABORT, 'Invalid selling_mode')
  END;
END;

-- Immutability trigger: selling_mode cannot be changed after creation
CREATE TRIGGER IF NOT EXISTS trg_designs_selling_mode_lock
BEFORE UPDATE OF selling_mode ON designs
BEGIN
  SELECT CASE
    WHEN OLD.selling_mode IS NOT NULL AND NEW.selling_mode != OLD.selling_mode
    THEN RAISE(ABORT, 'selling_mode cannot be changed after creation')
  END;
END;

INSERT OR IGNORE INTO _migrations VALUES (5, strftime('%s','now'));

COMMIT;
