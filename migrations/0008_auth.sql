-- Better Auth tables
CREATE TABLE IF NOT EXISTS "user" (
  id            TEXT PRIMARY KEY,
  name          TEXT,
  email         TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image         TEXT,
  createdAt     INTEGER NOT NULL,
  updatedAt     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  id            TEXT PRIMARY KEY,
  userId        TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,
  expiresAt     INTEGER NOT NULL,
  ipAddress     TEXT,
  userAgent     TEXT,
  createdAt     INTEGER NOT NULL,
  updatedAt     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "account" (
  id                    TEXT PRIMARY KEY,
  userId                TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  accountId             TEXT NOT NULL,
  providerId            TEXT NOT NULL,
  accessToken           TEXT,
  refreshToken          TEXT,
  accessTokenExpiresAt  INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope                 TEXT,
  idToken               TEXT,
  password              TEXT,
  createdAt             INTEGER NOT NULL,
  updatedAt             INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
  id          TEXT PRIMARY KEY,
  identifier  TEXT NOT NULL,
  value       TEXT NOT NULL,
  expiresAt   INTEGER NOT NULL,
  createdAt   INTEGER,
  updatedAt   INTEGER
);

-- Additional table for user↔wallet linking
CREATE TABLE IF NOT EXISTS wallet_backups (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL,
  address        TEXT NOT NULL,
  encrypted_blob TEXT NOT NULL,
  recovery_salt  TEXT NOT NULL,
  prf_salt       TEXT,
  credential_id  TEXT,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_backups_user_id ON wallet_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_backups_address ON wallet_backups(address);
