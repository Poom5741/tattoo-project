-- Better Auth tables (managed schema, created via better-auth)
-- Additional table for user↔wallet linking

CREATE TABLE IF NOT EXISTS wallet_backups (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  address       TEXT NOT NULL,
  encrypted_blob TEXT NOT NULL,
  recovery_salt TEXT NOT NULL,
  prf_salt      TEXT,
  credential_id TEXT,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_backups_user_id ON wallet_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_backups_address ON wallet_backups(address);
