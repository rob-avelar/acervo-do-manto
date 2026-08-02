import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acervo do Manto — Camisas de Futebol",
  description:
    "Camisas de futebol de clubes e seleções, retrôs e edições limitadas. Entrega para todo o Brasil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <header className="bg-manto text-white">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Acervo do Manto
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/" className="hover:text-manto-accent">
                Catálogo
              </Link>
              <Link href="/carrinho" className="hover:text-manto-accent">
                Carrinho
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">
          {children}
        </main>

        <footer className="border-t bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} Acervo do Manto · Entrega para todo o
            Brasil · Pagamento via Pix, boleto e cartão
          </div>
        </footer>
      </body>
    </html>
  );
}
