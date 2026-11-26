import type { Lang } from "./i18n";

type NamedProduct = {
  namePt: string;
  nameEn: string;
  nameNl: string;
};

/**
 * Nome do produto conforme o idioma.
 * - pt: português  - nl: holandês  - en/es: inglês (não há nome em espanhol)
 */
export function productName(p: NamedProduct, lang: Lang): string {
  switch (lang) {
    case "pt":
      return p.namePt;
    case "nl":
      return p.nameNl || p.nameEn;
    default:
      return p.nameEn;
  }
}
