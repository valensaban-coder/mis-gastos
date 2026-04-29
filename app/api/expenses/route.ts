import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import { parseExpenseText } from "@/lib/parser";

async function getUserEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.email ?? null;
}

export async function GET(request: NextRequest) {
  const email = await getUserEmail();
  if (!email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  try {
    const expenses =
      month && year
        ? await sql`
            SELECT * FROM expenses
            WHERE user_email = ${email}
              AND EXTRACT(MONTH FROM date) = ${parseInt(month)}
              AND EXTRACT(YEAR  FROM date) = ${parseInt(year)}
            ORDER BY date DESC, created_at DESC
          `
        : await sql`
            SELECT * FROM expenses
            WHERE user_email = ${email}
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
  const email = await getUserEmail();
  if (!email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

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
            INSERT INTO expenses (description, amount, category, date, source, user_email)
            VALUES (${description.trim()}, ${amount}, ${category}, ${date}, ${source}, ${email})
            RETURNING *
          `
        : await sql`
            INSERT INTO expenses (description, amount, category, source, user_email)
            VALUES (${description.trim()}, ${amount}, ${category}, ${source}, ${email})
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
      INSERT INTO expenses (description, amount, category, source, user_email)
      VALUES (${parsed.description}, ${parsed.amount}, ${parsed.category}, ${source}, ${email})
      RETURNING *
    `;

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Error al guardar el gasto" }, { status: 500 });
  }
}
