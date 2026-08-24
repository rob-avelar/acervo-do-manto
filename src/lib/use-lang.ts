"use client";

import { useEffect, useState } from "react";
import type { Lang } from "./i18n";

/** Lê o idioma do cookie (definido pelo middleware ou pelo seletor). */
export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("pt");
  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)lang=(pt|en)/);
    if (m) setLang(m[1] as Lang);
  }, []);
  return lang;
}
