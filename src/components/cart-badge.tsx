"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartBadge() {
  const { count } = useCart();
  return (
    <Link href="/carrinho" className="relative hover:text-manto-accent">
      Carrinho
      {count > 0 && (
        <span className="absolute -top-2 -right-4 rounded-full bg-manto-accent text-black text-xs font-bold min-w-[1.25rem] h-5 px-1 inline-flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
