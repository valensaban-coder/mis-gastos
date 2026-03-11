-- Run this in your Neon SQL editor to set up the database schema

CREATE TABLE IF NOT EXISTS expenses (
  id          SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('comida','transporte','entretenimiento','suscripciones','otros')),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  source      TEXT NOT NULL DEFAULT 'whatsapp' CHECK (source IN ('whatsapp','web')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast monthly queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);

-- Sample data (optional, remove in production)
INSERT INTO expenses (description, amount, category, source, date) VALUES
  ('Almuerzo con compañeros', 4500.00, 'comida', 'web', CURRENT_DATE),
  ('Uber al centro', 1800.00, 'transporte', 'web', CURRENT_DATE - 1),
  ('Netflix', 2900.00, 'suscripciones', 'web', CURRENT_DATE - 2),
  ('Café y medialunas', 850.00, 'comida', 'whatsapp', CURRENT_DATE - 3),
  ('Subte x10', 1500.00, 'transporte', 'whatsapp', CURRENT_DATE - 5),
  ('Cine', 3200.00, 'entretenimiento', 'web', CURRENT_DATE - 7);
