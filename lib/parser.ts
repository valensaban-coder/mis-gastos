export type Category =
  | "comida"
  | "transporte"
  | "entretenimiento"
  | "suscripciones"
  | "otros";

export interface ParsedExpense {
  description: string;
  amount: number;
  category: Category;
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  comida: [
    "pizza",
    "almuerzo",
    "cafe",
    "café",
    "desayuno",
    "cena",
    "empanada",
    "empanadas",
    "hamburguesa",
    "burger",
    "sushi",
    "delivery",
    "rappi",
    "pedidosya",
    "mcdonald",
    "mcdonalds",
    "burguer",
    "comida",
    "restaurant",
    "resto",
    "facturas",
    "medialunas",
    "milanesa",
    "pasta",
    "sandwich",
    "sandwiche",
    "bife",
    "asado",
    "tostado",
    "bagel",
    "sanguche",
    "tacos",
    "veggie",
    "helado",
    "postre",
    "torta",
    "pan",
    "panaderia",
    "supermercado",
    "super",
    "coto",
    "carrefour",
    "dia",
    "mercado",
    "chivito",
    "lomo",
    "paty",
  ],
  transporte: [
    "uber",
    "cabify",
    "subte",
    "sube",
    "taxi",
    "colectivo",
    "bondi",
    "bus",
    "tren",
    "remis",
    "nafta",
    "combustible",
    "estacionamiento",
    "parking",
    "peaje",
    "auto",
    "moto",
    "bicicleta",
    "ecobici",
    "aeropuerto",
    "vuelo",
    "avion",
    "avión",
    "transfer",
    "viaje",
    "viático",
    "viatico",
  ],
  entretenimiento: [
    "cine",
    "teatro",
    "bar",
    "boliche",
    "disco",
    "salida",
    "salidas",
    "recital",
    "concierto",
    "show",
    "museo",
    "juego",
    "steam",
    "playstation",
    "xbox",
    "nintendo",
    "videojuego",
    "libro",
    "revista",
    "bowling",
    "karting",
    "escape room",
    "antesala",
    "cerveza",
    "birra",
    "copa",
    "tragos",
    "vino",
  ],
  suscripciones: [
    "netflix",
    "spotify",
    "disney",
    "hbo",
    "amazon",
    "prime",
    "apple",
    "icloud",
    "chatgpt",
    "openai",
    "notion",
    "figma",
    "adobe",
    "canva",
    "youtube",
    "twitch",
    "gym",
    "gimnasio",
    "internet",
    "wifi",
    "luz",
    "agua",
    "gas",
    "telefono",
    "teléfono",
    "celular",
    "seguro",
    "alquiler",
    "expensas",
    "suscripcion",
    "suscripción",
    "cuota",
    "membresia",
    "membresía",
    "linkedin",
    "duolingo",
  ],
  otros: [],
};

/**
 * Parses free-text expense input like "almuerzo 1500" or "uber 2800 centro"
 * Returns null if no valid amount is found.
 */
export function parseExpenseText(text: string): ParsedExpense | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase();

  // Extract the first number (supports integers and decimals with . or ,)
  const amountMatch = normalized.match(/\b(\d{1,10}(?:[.,]\d{1,2})?)\b/);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(",", "."));
  if (isNaN(amount) || amount <= 0 || amount > 9_999_999) return null;

  // Description: remove the matched number from the original text
  const description =
    trimmed
      .replace(amountMatch[0], "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[-–—,]+|[-–—,]+$/g, "")
      .trim() || trimmed;

  // Detect category by scanning keywords
  let category: Category = "otros";
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [
    Category,
    string[],
  ][]) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      category = cat;
      break;
    }
  }

  return {
    description: capitalizeFirst(description),
    amount,
    category,
  };
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
