"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("busca") ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/?busca=${encodeURIComponent(term)}` : "/");
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-md">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por time ou seleção..."
        className="w-full rounded-full border border-white/30 bg-white/10 text-white placeholder-white/60 pl-10 pr-4 py-2 text-sm focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-400"
        aria-label="Buscar camisas"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-current opacity-70 hover:opacity-100"
      >
        {/* ícone de lupa */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
