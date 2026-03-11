import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

const VALID_CATEGORIES = [
  "comida",
  "transporte",
  "entretenimiento",
  "suscripciones",
  "otros",
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { category } = body as { category: string };

    if (!VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
      return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
    }

    const [expense] = await sql`
      UPDATE expenses
      SET category = ${category}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!expense) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("PATCH /api/expenses/[id] error:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const [deleted] = await sql`
      DELETE FROM expenses WHERE id = ${id} RETURNING id
    `;

    if (!deleted) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] error:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
