import type { Lang } from "./i18n";

// Mapa tamanho brasileiro -> internacional (para exibir em inglês).
const BR_TO_INTL: Record<string, string> = {
  P: "S",
  M: "M",
  G: "L",
  GG: "XL",
  "3G": "2XL",
  "4G": "3XL",
  "5G": "4XL",
};

/**
 * Rótulo do tamanho conforme o idioma. Em inglês converte P/M/G/GG/3G...
 * para S/M/L/XL/2XL... O valor guardado no pedido continua sendo o BR
 * (o fornecedor usa o padrão brasileiro).
 */
export function sizeLabel(size: string, lang: Lang): string {
  if (lang === "en") return BR_TO_INTL[size] ?? size;
  return size;
}
