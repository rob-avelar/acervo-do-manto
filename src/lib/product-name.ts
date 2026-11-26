import type { Lang } from "./i18n";

type NamedProduct = {
  namePt: string;
  nameEn: string;
  nameNl: string;
};

// --- Geração do nome em espanhol (España) a partir do título em inglês ---

const ES_COUNTRIES: Record<string, string> = {
  Brazil: "Brasil",
  Spain: "España",
  Germany: "Alemania",
  England: "Inglaterra",
  France: "Francia",
  Italy: "Italia",
  Mexico: "México",
  Netherlands: "Países Bajos",
  Croatia: "Croacia",
  Belgium: "Bélgica",
  Switzerland: "Suiza",
  Norway: "Noruega",
  Austria: "Austria",
  Scotland: "Escocia",
  Algeria: "Argelia",
  Morocco: "Marruecos",
  Tunisia: "Túnez",
  "South Africa": "Sudáfrica",
  Senegal: "Senegal",
  Ghana: "Ghana",
  Egypt: "Egipto",
  "Cape Verde": "Cabo Verde",
  "Ivory Coast": "Costa de Marfil",
  Colombia: "Colombia",
  Ecuador: "Ecuador",
  Uruguay: "Uruguay",
  Paraguay: "Paraguay",
  Japan: "Japón",
  "South Korea": "Corea del Sur",
  Australia: "Australia",
  "Saudi Arabia": "Arabia Saudí",
  Iran: "Irán",
  Jordan: "Jordania",
  Qatar: "Catar",
  Uzbekistan: "Uzbekistán",
  Panama: "Panamá",
  Haiti: "Haití",
  Curacao: "Curazao",
  "New Zealand": "Nueva Zelanda",
  Bosnia: "Bosnia",
  "Czech Republic": "República Checa",
  Turkiye: "Turquía",
  Sweden: "Suecia",
  Congo: "Congo",
  "DR Congo": "RD Congo",
  Iraq: "Irak",
  USA: "Estados Unidos",
  Canada: "Canadá",
  Ireland: "Irlanda",
  Wales: "Gales",
  Bolivia: "Bolivia",
  Chile: "Chile",
  Peru: "Perú",
  Venezuela: "Venezuela",
  Nigeria: "Nigeria",
  Cameroon: "Camerún",
  Jamaica: "Jamaica",
  Denmark: "Dinamarca",
  Poland: "Polonia",
  Serbia: "Serbia",
  Greece: "Grecia",
  Ukraine: "Ucrania",
  Russia: "Rusia",
  Portugal: "Portugal",
  Argentina: "Argentina",
};

const ES_REPLACEMENTS: [RegExp, string][] = [
  [/\bWorld Cup\b/gi, "Copa del Mundo"],
  [/\bPlayer Version\b/gi, "Versión Jugador"],
  [/\bLong Sleeve\b/gi, "Manga Larga"],
  [/\bPre[-\s]?Match\b/gi, "Pre-Partido"],
  [/\bGoalkeeper\b/gi, "Portero"],
  [/\bWomen'?s?\b/gi, "Femenina"],
  [/\bAnniversary\b/gi, "Aniversario"],
  [/\bSpecial\b/gi, "Especial"],
  [/\bConcept\b/gi, "Concepto"],
  [/\bHome\b/gi, "Local"],
  [/\bAway\b/gi, "Visitante"],
  [/\bThird\b/gi, "Tercera"],
  [/\bFourth\b/gi, "Cuarta"],
  [/\bTraining Suit\b/gi, "Chándal"],
  [/\bTracksuit\b/gi, "Chándal"],
  [/\bWindbreaker\b/gi, "Cortavientos"],
  [/\bJacket\b/gi, "Chaqueta"],
  [/\bHalf[-\s]?Zip\b/gi, "Media Cremallera"],
  [/\bHooded\b/gi, "Con Capucha"],
  [/\bFootball Jersey\b/gi, ""],
  [/\bJersey\b/gi, ""],
];

const OUTERWEAR_RE =
  /\b(jacket|tracksuit|training suit|windbreaker|half[-\s]?zip|hooded|polo)\b/i;

/** Monta o nome em espanhol a partir do título em inglês (nameEn). */
function nameEsFrom(title: string): string {
  const isKids = /\bkids\b/i.test(title) || /16-28/.test(title);
  const isOuterwear = OUTERWEAR_RE.test(title);

  let s = title;
  // Remove sufixo de tamanho
  s = s.replace(/\s+(S-\d?XL|S-XXL|S-XL|Size\s*[:：]\s*[\d-]+)\s*$/i, "");
  // Temporadas 2026-27 / 26-27 → 26/27
  s = s.replace(/\b20(\d{2})-(\d{2})\b/g, "$1/$2");
  s = s.replace(/\b(\d{2})-(\d{2})\b/g, "$1/$2");
  // Remove marcador de kids antes de traduzir termos
  s = s.replace(/\bKids Kit\b/gi, "").replace(/\bKids\b/gi, "");
  // Traduz termos
  for (const [re, to] of ES_REPLACEMENTS) s = s.replace(re, to);
  // Retro fica igual; país no começo (seleções)
  for (const [en, es] of Object.entries(ES_COUNTRIES)) {
    s = s.replace(new RegExp(`^${en}\\b`), es);
  }
  s = s.replace(/\s{2,}/g, " ").trim();

  if (isKids) return `Kit Niños ${s}`.replace(/\s{2,}/g, " ").trim();
  if (isOuterwear) return s; // jaquetas/chándales: sem prefijo "Camiseta"
  return `Camiseta ${s}`;
}

/**
 * Nome do produto conforme o idioma.
 * - pt: português  - nl: holandês  - es: espanhol (gerado do inglês)
 * - en (padrão): inglês
 */
export function productName(p: NamedProduct, lang: Lang): string {
  switch (lang) {
    case "pt":
      return p.namePt;
    case "nl":
      return p.nameNl || p.nameEn;
    case "es":
      return nameEsFrom(p.nameEn);
    default:
      return p.nameEn;
  }
}
