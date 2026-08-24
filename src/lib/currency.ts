/**
 * Utilitários de moeda. Os preços são armazenados em centavos de BRL (Int)
 * na base de dados. Para visitantes de fora do Brasil, convertemos e exibimos
 * em USD ou EUR (apenas exibição — o valor de referência é o real).
 */

export type Currency = "BRL" | "USD" | "EUR";

// Frete grátis acima deste subtotal (em centavos de BRL).
export const FREE_SHIPPING_CENTS = 30000;

// Taxas de conversão a partir do BRL. Ajuste conforme o câmbio / sua margem.
export const CURRENCIES: Record<
  Currency,
  { code: string; locale: string; rate: number }
> = {
  BRL: { code: "BRL", locale: "pt-BR", rate: 1 },
  USD: { code: "USD", locale: "en-US", rate: 0.222 },
  EUR: { code: "EUR", locale: "de-DE", rate: 0.195 },
};

/**
 * Formata centavos de BRL na moeda escolhida (convertendo se necessário).
 * Aplica preço "psicológico" terminando em .90.
 */
/**
 * Valor numérico convertido na moeda escolhida.
 * BRL termina em .90 (ex.: 179,90); USD/EUR arredondam para inteiro (ex.: $40).
 */
export function amountFor(
  brlCents: number,
  currency: Currency = "BRL",
): number {
  const c = CURRENCIES[currency] ?? CURRENCIES.BRL;
  const raw = (brlCents / 100) * c.rate;
  if (currency === "BRL") {
    return raw >= 1 ? Math.round(raw) - 0.1 : raw;
  }
  // USD / EUR: número inteiro
  return Math.max(raw >= 1 ? 1 : 0, Math.round(raw));
}

/** Valor em centavos da moeda de destino (para cobrar no Stripe). */
export function targetCents(
  brlCents: number,
  currency: Currency = "BRL",
): number {
  return Math.round(amountFor(brlCents, currency) * 100);
}

export function formatMoney(
  brlCents: number,
  currency: Currency = "BRL",
): string {
  const c = CURRENCIES[currency] ?? CURRENCIES.BRL;
  const digits = currency === "BRL" ? 2 : 0; // USD/EUR sem centavos
  return new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.code,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amountFor(brlCents, currency));
}

/** Formata centavos de BRL como "R$ 1.234,56" (compatibilidade). */
export function formatBRL(cents: number): string {
  return formatMoney(cents, "BRL");
}

/** Converte um valor em reais (ex.: 149.9) para centavos (14990). */
export function toCents(reais: number): number {
  return Math.round(reais * 100);
}

/** Percentagem de desconto entre preço cheio e preço atual, ou null. */
export function discountPercent(
  priceCents: number,
  compareCents?: number | null,
): number | null {
  if (!compareCents || compareCents <= priceCents) return null;
  return Math.round(((compareCents - priceCents) / compareCents) * 100);
}
