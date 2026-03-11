import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

const CATEGORIES = [
  "comida",
  "transporte",
  "entretenimiento",
  "suscripciones",
  "combustible",
  "salud",
  "otros",
] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") ?? new Date().getFullYear().toString();

  try {
    const rows = await sql`
      SELECT
        EXTRACT(MONTH FROM date)::int AS month,
        category,
        SUM(amount)::float            AS total
      FROM expenses
      WHERE EXTRACT(YEAR FROM date) = ${parseInt(year)}
      GROUP BY month, category
      ORDER BY month ASC
    `;

    // Pivot: one object per month with a key per category
    const byMonth: Record<number, Record<string, number>> = {};
    for (const row of rows) {
      if (!byMonth[row.month]) byMonth[row.month] = {};
      byMonth[row.month][row.category] = Number(row.total);
    }

    // Fill all 12 months
    const result = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const cats = byMonth[month] ?? {};
      const entry: Record<string, number | string> = { month };
      for (const cat of CATEGORIES) {
        entry[cat] = cats[cat] ?? 0;
      }
      return entry;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/expenses/monthly error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
