"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/clientes", label: "Clientes" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex md:flex-col gap-1">
      {LINKS.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-gold text-ink"
                : "text-gray-300 hover:bg-ink-700 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
