import { cookies, headers } from "next/headers";
import { langForCountry, type Lang } from "./i18n";

/** Idioma no servidor: cookie (escolha do usuário) ou país detectado. */
export function getServerLang(): Lang {
  const c = cookies().get("lang")?.value;
  if (c === "pt" || c === "en") return c;
  const country = headers().get("x-vercel-ip-country") ?? "BR";
  return langForCountry(country);
}
