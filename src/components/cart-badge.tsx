"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartBadge({ label = "Carrinho" }: { label?: string }) {
  const { count } = useCart();
  return (
    <Link
      href="/carrinho"
      aria-label={label}
      className="relative text-gray-300 hover:text-gold transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 rounded-full bg-gold text-ink text-[0.65rem] font-bold min-w-[1.1rem] h-[1.1rem] px-1 inline-flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
