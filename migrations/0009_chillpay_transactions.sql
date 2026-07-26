-- Migration: Create chillpay_transactions table
-- For ChillPay payment gateway integration

CREATE TABLE IF NOT EXISTS chillpay_transactions (
  id TEXT PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,
  chillpay_tx_id TEXT,
  design_id TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
  channel_code TEXT,
  customer_id TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  bank_ref_code TEXT,
  payment_status TEXT,
  payment_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (design_id) REFERENCES designs(id)
);

-- Index for order_no lookups
CREATE INDEX IF NOT EXISTS idx_chillpay_order_no ON chillpay_transactions(order_no);

-- Index for design_id
CREATE INDEX IF NOT EXISTS idx_chillpay_design_id ON chillpay_transactions(design_id);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_chillpay_status ON chillpay_transactions(status);
