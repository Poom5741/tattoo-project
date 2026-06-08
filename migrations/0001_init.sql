BEGIN;

CREATE TABLE IF NOT EXISTS artists (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  handle      TEXT,
  city        TEXT,
  style       TEXT,
  years       INTEGER,
  booked      TEXT,
  rate        INTEGER,
  bio         TEXT,
  pieces      INTEGER,
  rating      TEXT,
  seed        INTEGER,
  email       TEXT
);

CREATE TABLE IF NOT EXISTS designs (
  id                 TEXT PRIMARY KEY,
  n                  TEXT NOT NULL,
  title              TEXT NOT NULL,
  artist_id          TEXT NOT NULL REFERENCES artists(id),
  style              TEXT,
  price              REAL,
  price_usd          INTEGER,
  status             TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','sold','owned')),
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
  ipfs_cid           TEXT
);

CREATE TABLE IF NOT EXISTS booking_inquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id  TEXT,
  design_id  TEXT,
  name       TEXT NOT NULL,
  contact    TEXT NOT NULL,
  message    TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS mint_confirmations (
  tx_hash      TEXT PRIMARY KEY,
  token_id     INTEGER NOT NULL UNIQUE,
  buyer        TEXT,
  confirmed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_designs_status    ON designs(status);
CREATE INDEX IF NOT EXISTS idx_designs_artist_id ON designs(artist_id);
CREATE INDEX IF NOT EXISTS idx_mint_token_id     ON mint_confirmations(token_id);

INSERT OR IGNORE INTO _migrations VALUES (1, strftime('%s','now'));

COMMIT;
