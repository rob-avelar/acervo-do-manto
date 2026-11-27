import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";

export const metadata = {
  title: "Backoffice — Acervo do Manto",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-ink-600 bg-ink-800 p-4 md:p-5">
        <div className="mb-5">
          <span className="font-display text-lg font-bold">
            ACERVO <span className="text-gradient-gold">ADMIN</span>
          </span>
          <p className="text-[0.7rem] text-gray-500 mt-0.5">Backoffice</p>
        </div>
        <AdminNav />
        <div className="mt-6 pt-4 border-t border-ink-600">
          <Link
            href="/"
            target="_blank"
            className="text-xs text-gray-400 hover:text-gold"
          >
            ↗ Ver a loja
          </Link>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl">{children}</main>
    </div>
  );
}
