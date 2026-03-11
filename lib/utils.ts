import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const CATEGORY_LABELS: Record<string, string> = {
  comida: "Comida",
  transporte: "Transporte",
  entretenimiento: "Entretenimiento",
  suscripciones: "Suscripciones",
  combustible: "Combustible",
  salud: "Salud",
  otros: "Otros",
};

export const CATEGORY_COLORS: Record<string, string> = {
  comida: "#10b981",
  transporte: "#3b82f6",
  entretenimiento: "#f59e0b",
  suscripciones: "#8b5cf6",
  combustible: "#f97316",
  salud: "#ec4899",
  otros: "#6b7280",
};

export const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
