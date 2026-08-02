import type { ProductCategory } from "@prisma/client";

/** Rótulos das categorias em português do Brasil. */
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  NATIONAL_TEAM: "Seleções",
  CLUB: "Clubes",
  RETRO: "Retrô",
  LIMITED: "Edição Limitada",
};

export const CATEGORY_ORDER: ProductCategory[] = [
  "CLUB",
  "NATIONAL_TEAM",
  "RETRO",
  "LIMITED",
];
