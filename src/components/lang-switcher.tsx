"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/lib/use-lang";
import type { Lang } from "@/lib/i18n";

export function LangSwitcher() {
  const lang = useLang();
  const router = useRouter();

  function choose(l: Lang) {
    document.cookie = `lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
    // recarrega para atualizar componentes de servidor e cliente
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        type="button"
        onClick={() => choose("pt")}
        className={lang === "pt" ? "text-gold font-bold" : "text-gray-400 hover:text-white"}
        aria-label="Português"
      >
        PT
      </button>
      <span className="text-gray-600">/</span>
      <button
        type="button"
        onClick={() => choose("en")}
        className={lang === "en" ? "text-gold font-bold" : "text-gray-400 hover:text-white"}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
