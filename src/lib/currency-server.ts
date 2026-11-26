import { cookies, headers } from "next/headers";
import { currencyForCountry } from "./geo";
import { effectiveCurrency, type Currency } from "./currency";
import { getServerLang } from "./lang-server";

/** Moeda de exibição no servidor. A escolha manual do cliente (curManual)
 *  tem prioridade; senão usa o cookie/geo com a regra de inglês nunca mostrar
 *  Reais. */
export function getServerCurrency(): Currency {
  const manual = cookies().get("curManual")?.value;
  if (manual === "BRL" || manual === "USD" || manual === "EUR") return manual;

  const c = cookies().get("cur")?.value;
  let cur: Currency;
  if (c === "BRL" || c === "USD" || c === "EUR") {
    cur = c;
  } else {
    const country = headers().get("x-vercel-ip-country") ?? "BR";
    cur = currencyForCountry(country);
  }
  return effectiveCurrency(cur, getServerLang());
}
