/**
 * Utilitários de moeda para o mercado brasileiro (BRL).
 * Todos os valores são armazenados em centavos (Int) na base de dados.
 */

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata centavos de BRL como "R$ 1.234,56". */
export function formatBRL(cents: number): string {
  return brlFormatter.format(cents / 100);
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
