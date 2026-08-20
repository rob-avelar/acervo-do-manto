"use client";

import { useEffect, useState } from "react";
import type { Currency } from "./currency";

/** Lê a moeda de exibição do cookie definido pelo middleware (cliente). */
export function useCurrency(): Currency {
  const [cur, setCur] = useState<Currency>("BRL");
  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)cur=(BRL|USD|EUR)/);
    if (m) setCur(m[1] as Currency);
  }, []);
  return cur;
}
