-- Run this in your Neon SQL editor to add multi-user support

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_email TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_expenses_user_email ON expenses (user_email);
