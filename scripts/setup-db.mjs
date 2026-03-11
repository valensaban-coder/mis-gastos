import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL =
  "postgresql://neondb_owner:npg_bqEUakK09fon@ep-crimson-sun-aevd5eep-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(DATABASE_URL);

const setup = `
CREATE TABLE IF NOT EXISTS expenses (
  id          SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('comida','transporte','entretenimiento','suscripciones','otros')),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  source      TEXT NOT NULL DEFAULT 'whatsapp' CHECK (source IN ('whatsapp','web')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date     ON expenses (date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);
`;

const statements = [
  `CREATE TABLE IF NOT EXISTS expenses (
    id          SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount      NUMERIC(12,2) NOT NULL,
    category    TEXT NOT NULL CHECK (category IN ('comida','transporte','entretenimiento','suscripciones','otros')),
    date        DATE NOT NULL DEFAULT CURRENT_DATE,
    source      TEXT NOT NULL DEFAULT 'whatsapp' CHECK (source IN ('whatsapp','web')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_date     ON expenses (date DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category)`,
];

try {
  for (const stmt of statements) {
    await sql(stmt);
  }
  console.log("✅ Tabla 'expenses' e índices creados correctamente.");
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}
