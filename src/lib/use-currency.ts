"use client";

import { useEffect, useState } from "react";
import { effectiveCurrency, type Currency } from "./currency";
import type { Lang } from "./i18n";

function readCookie(re: RegExp): string | null {
  const m = document.cookie.match(re);
  return m ? m[1] : null;
}

/** Moeda: escolha manual do cliente (curManual) tem prioridade; senão
 *  a detecção automática (cookie cur) com a regra inglês-nunca-R$. */
export function useCurrency(): Currency {
  const [cur, setCur] = useState<Currency>("BRL");
  useEffect(() => {
    const manual = readCookie(/(?:^|;\s*)curManual=(BRL|USD|EUR)/) as
      | Currency
      | null;
    if (manual) {
      setCur(manual);
      return;
    }
    const c = readCookie(/(?:^|;\s*)cur=(BRL|USD|EUR)/) as Currency | null;
    const lang = (readCookie(/(?:^|;\s*)lang=(pt|en)/) ?? "pt") as Lang;
    setCur(effectiveCurrency(c ?? "BRL", lang));
  }, []);
  return cur;
}
