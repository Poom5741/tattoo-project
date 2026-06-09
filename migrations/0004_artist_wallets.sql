ALTER TABLE artists ADD COLUMN wallet_address TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_artists_wallet ON artists(wallet_address);
ALTER TABLE booking_inquiries ADD COLUMN buyer_wallet TEXT;
INSERT OR IGNORE INTO _migrations VALUES (4, strftime('%s','now'));
