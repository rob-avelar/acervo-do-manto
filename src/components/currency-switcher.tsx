"use client";

import { useCurrency } from "@/lib/use-currency";
import type { Currency } from "@/lib/currency";

const SYMBOLS: Record<Currency, string> = {
  BRL: "R$",
  USD: "$",
  EUR: "€",
};

export function CurrencySwitcher() {
  const cur = useCurrency();

  function choose(c: Currency) {
    document.cookie = `curManual=${c}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      {(["BRL", "USD", "EUR"] as Currency[]).map((c, i) => (
        <span key={c} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-600">/</span>}
          <button
            type="button"
            onClick={() => choose(c)}
            className={
              cur === c
                ? "text-gold font-bold"
                : "text-gray-400 hover:text-white"
            }
            aria-label={c}
          >
            {SYMBOLS[c]}
          </button>
        </span>
      ))}
    </div>
  );
}
