"use client";

import { useEffect, useState } from "react";
import { effectiveCurrency, type Currency } from "./currency";
import type { Lang } from "./i18n";

function readCookie(re: RegExp): string | null {
  const m = document.cookie.match(re);
  return m ? m[1] : null;
}

/** Lê a moeda do cookie e aplica a regra: interface em inglês nunca mostra Reais. */
export function useCurrency(): Currency {
  const [cur, setCur] = useState<Currency>("BRL");
  useEffect(() => {
    const c = readCookie(/(?:^|;\s*)cur=(BRL|USD|EUR)/) as Currency | null;
    const lang = (readCookie(/(?:^|;\s*)lang=(pt|en)/) ?? "pt") as Lang;
    setCur(effectiveCurrency(c ?? "BRL", lang));
  }, []);
  return cur;
}
