import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { parseExpenseText } from "@/lib/parser";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  try {
    const expenses =
      month && year
        ? await sql`
            SELECT * FROM expenses
            WHERE EXTRACT(MONTH FROM date) = ${parseInt(month)}
              AND EXTRACT(YEAR  FROM date) = ${parseInt(year)}
            ORDER BY date DESC, created_at DESC
          `
        : await sql`
            SELECT * FROM expenses
            ORDER BY date DESC, created_at DESC
            LIMIT 200
          `;

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Structured payload: { description, amount, category, date, source }
    if (body.description !== undefined) {
      const { description, amount, category, date, source = "web" } = body as {
        description: string;
        amount: number;
        category: string;
        date?: string;
        source?: "web" | "whatsapp";
      };

      if (!description?.trim() || !amount || amount <= 0) {
        return NextResponse.json(
          { error: "Descripción y monto son requeridos" },
          { status: 400 },
        );
      }

      const [expense] = date
        ? await sql`
            INSERT INTO expenses (description, amount, category, date, source)
            VALUES (${description.trim()}, ${amount}, ${category}, ${date}, ${source})
            RETURNING *
          `
        : await sql`
            INSERT INTO expenses (description, amount, category, source)
            VALUES (${description.trim()}, ${amount}, ${category}, ${source})
            RETURNING *
          `;

      return NextResponse.json(expense, { status: 201 });
    }

    // Free-text payload: { text, source }
    const { text, source = "web" } = body as {
      text: string;
      source?: "web" | "whatsapp";
    };

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "El campo text es requerido" },
        { status: 400 },
      );
    }

    const parsed = parseExpenseText(text);
    if (!parsed) {
      return NextResponse.json(
        { error: 'No se pudo detectar un monto. Escribí algo como "almuerzo 1500"' },
        { status: 400 },
      );
    }

    const [expense] = await sql`
      INSERT INTO expenses (description, amount, category, source)
      VALUES (${parsed.description}, ${parsed.amount}, ${parsed.category}, ${source})
      RETURNING *
    `;

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Error al guardar el gasto" }, { status: 500 });
  }
}
