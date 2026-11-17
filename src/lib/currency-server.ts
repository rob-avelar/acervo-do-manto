import { cookies, headers } from "next/headers";
import { currencyForCountry } from "./geo";
import { effectiveCurrency, type Currency } from "./currency";
import { getServerLang } from "./lang-server";

/** Moeda de exibição no servidor: usa o cookie (middleware) ou o header de país,
 *  aplicando a regra de que a interface em inglês nunca mostra Reais. */
export function getServerCurrency(): Currency {
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
