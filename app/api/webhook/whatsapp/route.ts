import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import sql from "@/lib/db";
import { parseExpenseText } from "@/lib/parser";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const CATEGORY_EMOJI: Record<string, string> = {
  comida: "🍕",
  transporte: "🚗",
  entretenimiento: "🎬",
  suscripciones: "📱",
  combustible: "⛽",
  salud: "🏥",
  ropa: "👕",
  regalos: "🎁",
  hogar: "🏠",
  viajes: "✈️",
  otros: "📦",
};

// Verify Meta's X-Hub-Signature-256 header
function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WHATSAPP_TOKEN;
  if (!secret || !signature) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// GET — Meta webhook verification handshake
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST — Receive incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || message.type !== "text") {
      return NextResponse.json({ status: "ignored" });
    }

    const from: string = message.from;
    const text: string = message.text?.body ?? "";

    const parsed = parseExpenseText(text);

    if (!parsed) {
      await sendWhatsAppMessage(
        from,
        "❌ No pude detectar un monto en tu mensaje.\n\nProbá así:\n• *almuerzo 1500*\n• *uber 2800*\n• *netflix 3500*",
      );
      return NextResponse.json({ status: "parse_error" });
    }

    // Associate expense with the user matching this WhatsApp number
    const [userRow] = await sql`
      SELECT DISTINCT user_email FROM expenses
      WHERE whatsapp_phone = ${from}
      LIMIT 1
    `.catch(() => [null]);

    const userEmail = userRow?.user_email ?? from;

    await sql`
      INSERT INTO expenses (description, amount, category, source, user_email)
      VALUES (${parsed.description}, ${parsed.amount}, ${parsed.category}, 'whatsapp', ${userEmail})
    `;

    const emoji = CATEGORY_EMOJI[parsed.category] ?? "📦";
    const amountFormatted = new Intl.NumberFormat("es-AR").format(parsed.amount);

    await sendWhatsAppMessage(
      from,
      `✅ *Gasto registrado!*\n\n${emoji} ${parsed.description}\n💰 $${amountFormatted}\n📂 ${parsed.category}`,
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("POST /api/webhook/whatsapp error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
