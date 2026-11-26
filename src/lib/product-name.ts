import type { Lang } from "./i18n";

type NamedProduct = {
  namePt: string;
  nameEn: string;
  nameNl: string;
};

const OUTERWEAR_RE =
  /\b(jacket|tracksuit|training suit|windbreaker|half[-\s]?zip|hooded|polo)\b/i;

type NameConfig = {
  replacements: [RegExp, string][];
  countries: Record<string, string>;
  shirtPrefix: string; // prefixo para camisas (ex.: "Camiseta")
  kidsPrefix: string; // prefixo para infantil (ex.: "Kit Niños")
};

/** Núcleo de geração de nome a partir do título em inglês (nameEn). */
function buildName(title: string, cfg: NameConfig): string {
  const isKids = /\bkids\b/i.test(title) || /16-28/.test(title);
  const isOuterwear = OUTERWEAR_RE.test(title);

  let s = title;
  s = s.replace(/\s+(S-\d?XL|S-XXL|S-XL|Size\s*[:：]\s*[\d-]+)\s*$/i, "");
  s = s.replace(/\b20(\d{2})-(\d{2})\b/g, "$1/$2");
  s = s.replace(/\b(\d{2})-(\d{2})\b/g, "$1/$2");
  s = s.replace(/\bKids Kit\b/gi, "").replace(/\bKids\b/gi, "");
  for (const [re, to] of cfg.replacements) s = s.replace(re, to);
  for (const [en, tr] of Object.entries(cfg.countries)) {
    s = s.replace(new RegExp(`^${en}\\b`), tr);
  }
  s = s.replace(/\s{2,}/g, " ").trim();

  if (isKids) return `${cfg.kidsPrefix} ${s}`.replace(/\s{2,}/g, " ").trim();
  if (isOuterwear) return s;
  return `${cfg.shirtPrefix} ${s}`.replace(/\s{2,}/g, " ").trim();
}

// --- Espanhol (España) ---
const ES_COUNTRIES: Record<string, string> = {
  Brazil: "Brasil", Spain: "España", Germany: "Alemania", England: "Inglaterra",
  France: "Francia", Italy: "Italia", Mexico: "México", Netherlands: "Países Bajos",
  Croatia: "Croacia", Belgium: "Bélgica", Switzerland: "Suiza", Norway: "Noruega",
  Austria: "Austria", Scotland: "Escocia", Algeria: "Argelia", Morocco: "Marruecos",
  Tunisia: "Túnez", "South Africa": "Sudáfrica", Senegal: "Senegal", Ghana: "Ghana",
  Egypt: "Egipto", "Cape Verde": "Cabo Verde", "Ivory Coast": "Costa de Marfil",
  Colombia: "Colombia", Ecuador: "Ecuador", Uruguay: "Uruguay", Paraguay: "Paraguay",
  Japan: "Japón", "South Korea": "Corea del Sur", Australia: "Australia",
  "Saudi Arabia": "Arabia Saudí", Iran: "Irán", Jordan: "Jordania", Qatar: "Catar",
  Uzbekistan: "Uzbekistán", Panama: "Panamá", Haiti: "Haití", Curacao: "Curazao",
  "New Zealand": "Nueva Zelanda", Bosnia: "Bosnia", "Czech Republic": "República Checa",
  Turkiye: "Turquía", Sweden: "Suecia", Congo: "Congo", "DR Congo": "RD Congo",
  Iraq: "Irak", USA: "Estados Unidos", Canada: "Canadá", Ireland: "Irlanda",
  Wales: "Gales", Bolivia: "Bolivia", Chile: "Chile", Peru: "Perú",
  Venezuela: "Venezuela", Nigeria: "Nigeria", Cameroon: "Camerún", Jamaica: "Jamaica",
  Denmark: "Dinamarca", Poland: "Polonia", Serbia: "Serbia", Greece: "Grecia",
  Ukraine: "Ucrania", Russia: "Rusia", Portugal: "Portugal", Argentina: "Argentina",
};
const ES_REPLACEMENTS: [RegExp, string][] = [
  [/\bWorld Cup\b/gi, "Copa del Mundo"], [/\bPlayer Version\b/gi, "Versión Jugador"],
  [/\bLong Sleeve\b/gi, "Manga Larga"], [/\bPre[-\s]?Match\b/gi, "Pre-Partido"],
  [/\bGoalkeeper\b/gi, "Portero"], [/\bWomen'?s?\b/gi, "Femenina"],
  [/\bAnniversary\b/gi, "Aniversario"], [/\bSpecial\b/gi, "Especial"],
  [/\bConcept\b/gi, "Concepto"], [/\bHome\b/gi, "Local"], [/\bAway\b/gi, "Visitante"],
  [/\bThird\b/gi, "Tercera"], [/\bFourth\b/gi, "Cuarta"],
  [/\bTraining Suit\b/gi, "Chándal"], [/\bTracksuit\b/gi, "Chándal"],
  [/\bWindbreaker\b/gi, "Cortavientos"], [/\bJacket\b/gi, "Chaqueta"],
  [/\bHalf[-\s]?Zip\b/gi, "Media Cremallera"], [/\bHooded\b/gi, "Con Capucha"],
  [/\bFootball Jersey\b/gi, ""], [/\bJersey\b/gi, ""],
];

// --- Holandês (Nederlands) ---
const NL_COUNTRIES: Record<string, string> = {
  Brazil: "Brazilië", Spain: "Spanje", Germany: "Duitsland", England: "Engeland",
  France: "Frankrijk", Italy: "Italië", Mexico: "Mexico", Netherlands: "Nederland",
  Croatia: "Kroatië", Belgium: "België", Switzerland: "Zwitserland", Norway: "Noorwegen",
  Austria: "Oostenrijk", Scotland: "Schotland", Algeria: "Algerije", Morocco: "Marokko",
  Tunisia: "Tunesië", "South Africa": "Zuid-Afrika", Senegal: "Senegal", Ghana: "Ghana",
  Egypt: "Egypte", "Cape Verde": "Kaapverdië", "Ivory Coast": "Ivoorkust",
  Colombia: "Colombia", Ecuador: "Ecuador", Uruguay: "Uruguay", Paraguay: "Paraguay",
  Japan: "Japan", "South Korea": "Zuid-Korea", Australia: "Australië",
  "Saudi Arabia": "Saoedi-Arabië", Iran: "Iran", Jordan: "Jordanië", Qatar: "Qatar",
  Uzbekistan: "Oezbekistan", Panama: "Panama", Haiti: "Haïti", Curacao: "Curaçao",
  "New Zealand": "Nieuw-Zeeland", Bosnia: "Bosnië", "Czech Republic": "Tsjechië",
  Turkiye: "Turkije", Sweden: "Zweden", Congo: "Congo", "DR Congo": "DR Congo",
  Iraq: "Irak", USA: "Verenigde Staten", Canada: "Canada", Ireland: "Ierland",
  Wales: "Wales", Bolivia: "Bolivia", Chile: "Chili", Peru: "Peru",
  Venezuela: "Venezuela", Nigeria: "Nigeria", Cameroon: "Kameroen", Jamaica: "Jamaica",
  Denmark: "Denemarken", Poland: "Polen", Serbia: "Servië", Greece: "Griekenland",
  Ukraine: "Oekraïne", Russia: "Rusland", Portugal: "Portugal", Argentina: "Argentinië",
};
const NL_REPLACEMENTS: [RegExp, string][] = [
  [/\bWorld Cup\b/gi, "WK"], [/\bPlayer Version\b/gi, "Spelersversie"],
  [/\bLong Sleeve\b/gi, "Lange Mouw"], [/\bPre[-\s]?Match\b/gi, "Pre-Match"],
  [/\bGoalkeeper\b/gi, "Keeper"], [/\bWomen'?s?\b/gi, "Dames"],
  [/\bAnniversary\b/gi, "Jubileum"], [/\bSpecial\b/gi, "Speciaal"],
  [/\bConcept\b/gi, "Concept"], [/\bHome\b/gi, "Thuis"], [/\bAway\b/gi, "Uit"],
  [/\bThird\b/gi, "Derde"], [/\bFourth\b/gi, "Vierde"],
  [/\bTraining Suit\b/gi, "Trainingspak"], [/\bTracksuit\b/gi, "Trainingspak"],
  [/\bWindbreaker\b/gi, "Windjack"], [/\bJacket\b/gi, "Jack"],
  [/\bHalf[-\s]?Zip\b/gi, "Halve Rits"], [/\bHooded\b/gi, "Met Capuchon"],
  [/\bFootball Jersey\b/gi, ""], [/\bJersey\b/gi, ""],
];

const ES_CFG: NameConfig = {
  replacements: ES_REPLACEMENTS,
  countries: ES_COUNTRIES,
  shirtPrefix: "Camiseta",
  kidsPrefix: "Kit Niños",
};
const NL_CFG: NameConfig = {
  replacements: NL_REPLACEMENTS,
  countries: NL_COUNTRIES,
  shirtPrefix: "Shirt",
  kidsPrefix: "Kindertenue",
};

/**
 * Nome do produto conforme o idioma.
 * - pt: português (do banco)  - es/nl: gerados a partir do inglês
 * - en (padrão): inglês (título original)
 */
export function productName(p: NamedProduct, lang: Lang): string {
  switch (lang) {
    case "pt":
      return p.namePt;
    case "es":
      return buildName(p.nameEn, ES_CFG);
    case "nl":
      return buildName(p.nameEn, NL_CFG);
    default:
      return p.nameEn;
  }
}
