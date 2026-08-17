import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { CartBadge } from "@/components/cart-badge";
import { SearchBar } from "@/components/search-bar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});

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
    <html lang="pt-BR" className={`${inter.variable} ${oswald.variable}`}>
      <body className="min-h-screen flex flex-col bg-ink text-white font-sans">
        <CartProvider>
          {/* Barra de anúncio */}
          <div className="bg-gold text-ink text-center text-xs md:text-sm font-semibold py-2 px-4">
            🚚 Frete grátis acima de R$300 · 💳 Pix, boleto e cartão · Entrega
            para todo o Brasil
          </div>

          {/* Header */}
          <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-ink-600">
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/" className="shrink-0 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Acervo do Manto"
                  className="h-12 w-12 rounded-full object-cover"
                />
                <span className="font-display text-xl font-bold tracking-wide hidden sm:inline">
                  ACERVO <span className="text-gradient-gold">DO MANTO</span>
                </span>
              </Link>
              <div className="order-3 w-full md:order-none md:flex-1 md:w-auto">
                <Suspense fallback={null}>
                  <SearchBar />
                </Suspense>
              </div>
              <nav className="flex gap-6 text-sm items-center shrink-0 ml-auto md:ml-0">
                <Link
                  href="/"
                  className="text-gray-300 hover:text-gold transition-colors"
                >
                  Catálogo
                </Link>
                <CartBadge />
              </nav>
            </div>
          </header>

          <main className="flex-1 w-full">{children}</main>

          {/* Footer */}
          <footer className="border-t border-ink-600 bg-ink-800 mt-16">
            <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-4">
              <div className="md:col-span-2">
                <span className="font-display text-lg font-bold">
                  ACERVO <span className="text-gradient-gold">DO MANTO</span>
                </span>
                <p className="mt-3 text-sm text-gray-400 max-w-sm">
                  Camisas de futebol de clubes e seleções, retrôs e edições
                  limitadas. Qualidade e entrega para todo o Brasil.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 text-gold">Loja</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link href="/?categoria=NATIONAL_TEAM" className="hover:text-white">
                      Seleções
                    </Link>
                  </li>
                  <li>
                    <Link href="/?categoria=CLUB" className="hover:text-white">
                      Clubes
                    </Link>
                  </li>
                  <li>
                    <Link href="/?categoria=RETRO" className="hover:text-white">
                      Retrô
                    </Link>
                  </li>
                  <li>
                    <Link href="/?categoria=LIMITED" className="hover:text-white">
                      Edição Limitada
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 text-gold">Ajuda</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Entrega para todo o Brasil</li>
                  <li>Pix, boleto e cartão</li>
                  <li>Frete grátis acima de R$300</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-ink-600">
              <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-gray-500">
                © {new Date().getFullYear()} Acervo do Manto · Todos os direitos
                reservados
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
