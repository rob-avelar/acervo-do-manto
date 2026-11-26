"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/use-lang";
import { useCurrency } from "@/lib/use-currency";
import type { Lang } from "@/lib/i18n";
import type { Currency } from "@/lib/currency";

const LANGS: { code: Lang; label: string }[] = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "nl", label: "Nederlands" },
];

const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: "BRL", symbol: "R$", label: "Real" },
  { code: "USD", symbol: "$", label: "Dólar" },
  { code: "EUR", symbol: "€", label: "Euro" },
];

const SYMBOL: Record<Currency, string> = { BRL: "R$", USD: "$", EUR: "€" };

export function PrefsMenu({
  langHeader,
  currencyHeader,
}: {
  langHeader: string;
  currencyHeader: string;
}) {
  const lang = useLang();
  const currency = useCurrency();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  function chooseLang(l: Lang) {
    document.cookie = `lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
    window.location.reload();
  }

  function chooseCurrency(c: Currency) {
    document.cookie = `curManual=${c}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${langHeader} / ${currencyHeader}`}
        className="flex items-center gap-1.5 text-gray-300 hover:text-gold transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.95 8.95 0 0 0 4.5-1.207M12 21a8.95 8.95 0 0 1-4.5-1.207M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9Z"
          />
        </svg>
        <span className="text-xs font-semibold uppercase">
          {lang} · {SYMBOL[currency]}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 rounded-xl border border-ink-600 bg-ink-800 shadow-xl p-2 z-50"
        >
          <p className="px-2 pt-1 pb-1 text-[0.7rem] uppercase tracking-wide text-gray-500">
            {langHeader}
          </p>
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => chooseLang(l.code)}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center justify-between hover:bg-ink-700 ${
                lang === l.code ? "text-gold font-semibold" : "text-gray-200"
              }`}
            >
              {l.label}
              {lang === l.code && <span>✓</span>}
            </button>
          ))}

          <div className="my-1 border-t border-ink-600" />

          <p className="px-2 pt-1 pb-1 text-[0.7rem] uppercase tracking-wide text-gray-500">
            {currencyHeader}
          </p>
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => chooseCurrency(c.code)}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center justify-between hover:bg-ink-700 ${
                currency === c.code ? "text-gold font-semibold" : "text-gray-200"
              }`}
            >
              <span>
                <span className="inline-block w-6 font-semibold">
                  {c.symbol}
                </span>
                {c.label}
              </span>
              {currency === c.code && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
