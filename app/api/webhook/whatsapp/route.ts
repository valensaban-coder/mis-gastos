import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { parseExpenseText } from "@/lib/parser";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

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
    const body = await request.json();

    // Navigate the Meta webhook payload structure
    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // Ignore non-text messages (images, audio, etc.)
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

    await sql`
      INSERT INTO expenses (description, amount, category, source)
      VALUES (${parsed.description}, ${parsed.amount}, ${parsed.category}, 'whatsapp')
    `;

    const CATEGORY_EMOJI: Record<string, string> = {
      comida: "🍕",
      transporte: "🚗",
      entretenimiento: "🎬",
      suscripciones: "📱",
      otros: "📦",
    };

    const emoji = CATEGORY_EMOJI[parsed.category] ?? "📦";
    const amountFormatted = new Intl.NumberFormat("es-AR").format(parsed.amount);

    await sendWhatsAppMessage(
      from,
      `✅ *Gasto registrado!*\n\n${emoji} ${parsed.description}\n💰 $${amountFormatted}\n📂 ${parsed.category}`,
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("POST /api/webhook/whatsapp error:", error);
    // Return 200 to Meta to prevent retries
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
