import type { Lang } from "./i18n";

// Preços dos adicionais (em centavos de BRL). Custo fornecedor: personalização
// +US$3, patch +US$1 — aqui com margem.
export const ADDON_CENTS = {
  name: 1990, // nome na camisa
  number: 1490, // número
  patch: 1490, // patch/escudo da liga
} as const;

export type Customization = {
  name?: string;
  number?: string;
  patch?: string;
};

/** Soma dos adicionais com base no que foi preenchido. */
export function extraCentsFor(c: Customization | undefined): number {
  if (!c) return 0;
  let e = 0;
  if (c.name && c.name.trim()) e += ADDON_CENTS.name;
  if (c.number && c.number.trim()) e += ADDON_CENTS.number;
  if (c.patch && c.patch.trim()) e += ADDON_CENTS.patch;
  return e;
}

/** Texto legível da personalização (para carrinho, pedido e admin). */
export function customizationLabel(
  c: Customization | undefined,
  lang: Lang = "pt",
): string {
  if (!c) return "";
  const parts: string[] = [];
  if (c.name && c.name.trim())
    parts.push(`${lang === "en" ? "Name" : "Nome"}: ${c.name.trim().toUpperCase()}`);
  if (c.number && c.number.trim())
    parts.push(`${lang === "en" ? "Number" : "Número"}: ${c.number.trim()}`);
  if (c.patch && c.patch.trim()) parts.push(`Patch: ${c.patch.trim()}`);
  return parts.join(" · ");
}

/** Assinatura usada para diferenciar linhas do carrinho. */
export function customizationKey(c: Customization | undefined): string {
  if (!c) return "";
  return `${c.name?.trim() ?? ""}|${c.number?.trim() ?? ""}|${c.patch?.trim() ?? ""}`;
}
