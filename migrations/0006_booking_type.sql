ALTER TABLE booking_inquiries ADD COLUMN booking_type TEXT NOT NULL DEFAULT 'plate';
ALTER TABLE booking_inquiries ADD COLUMN custom_style TEXT;
ALTER TABLE booking_inquiries ADD COLUMN custom_size TEXT;
ALTER TABLE booking_inquiries ADD COLUMN custom_placement TEXT;
ALTER TABLE booking_inquiries ADD COLUMN custom_budget TEXT;
INSERT OR IGNORE INTO _migrations VALUES (6, strftime('%s','now'));
