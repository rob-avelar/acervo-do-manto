import type { Currency } from "./currency";

// Países da Europa (usam EUR na exibição).
const EUROPE = new Set([
  "PT", "ES", "FR", "DE", "IT", "NL", "BE", "LU", "IE", "AT", "FI", "GR",
  "CY", "MT", "SK", "SI", "EE", "LV", "LT", "HR", "GB", "CH", "NO", "SE",
  "DK", "PL", "CZ", "HU", "RO", "BG", "IS", "LI", "MC", "AD", "SM", "VA",
]);

/** Retorna a moeda de exibição a partir do código de país (ISO-2). */
export function currencyForCountry(country?: string | null): Currency {
  const c = (country ?? "").toUpperCase();
  if (c === "BR") return "BRL";
  if (EUROPE.has(c)) return "EUR";
  if (c === "US") return "USD";
  // padrão internacional
  return "USD";
}
