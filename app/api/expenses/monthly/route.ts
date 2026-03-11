import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") ?? new Date().getFullYear().toString();

  try {
    const rows = await sql`
      SELECT
        EXTRACT(MONTH FROM date)::int AS month,
        EXTRACT(YEAR  FROM date)::int AS year,
        SUM(amount)::numeric          AS total,
        COUNT(*)::int                 AS count
      FROM expenses
      WHERE EXTRACT(YEAR FROM date) = ${parseInt(year)}
      GROUP BY month, year
      ORDER BY month ASC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/expenses/monthly error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
