import { cookies, headers } from "next/headers";
import { currencyForCountry } from "./geo";
import type { Currency } from "./currency";

/** Moeda de exibição no servidor: usa o cookie (middleware) ou o header de país. */
export function getServerCurrency(): Currency {
  const c = cookies().get("cur")?.value;
  if (c === "BRL" || c === "USD" || c === "EUR") return c;
  const country = headers().get("x-vercel-ip-country") ?? "BR";
  return currencyForCountry(country);
}
