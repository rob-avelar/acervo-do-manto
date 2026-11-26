import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { CartBadge } from "@/components/cart-badge";
import { SearchBar } from "@/components/search-bar";
import { PrefsMenu } from "@/components/prefs-menu";
import { getServerLang } from "@/lib/lang-server";
import { getServerCurrency } from "@/lib/currency-server";
import { formatMoney, FREE_SHIPPING_CENTS } from "@/lib/currency";
import { dict } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: "Acervo do Manto — Football Shirts",
  description:
    "Club and national team football shirts, retros and limited editions. Worldwide shipping.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = getServerLang();
  const currency = getServerCurrency();
  const t = dict[lang];
  const freeShipAmt = formatMoney(FREE_SHIPPING_CENTS, currency);

  return (
    <html
      lang={
        lang === "pt" ? "pt-BR" : lang === "es" ? "es" : lang === "nl" ? "nl" : "en"
      }
      className={`${inter.variable} ${oswald.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-ink text-white font-sans">
        <CartProvider>
          {/* Barra de anúncio */}
          <div className="bg-gold text-ink text-center text-xs md:text-sm font-semibold py-2 px-4">
            {t.announce}
          </div>

          {/* Header */}
          <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-ink-600">
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/" className="shrink-0 flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Acervo do Manto"
                  className="h-16 w-16 md:h-[72px] md:w-[72px] object-contain"
                />
              </Link>
              <div className="order-3 w-full md:order-none md:flex-1 md:w-auto">
                <Suspense fallback={null}>
                  <SearchBar placeholder={t.search} />
                </Suspense>
              </div>
              <nav className="flex gap-4 text-sm items-center shrink-0 ml-auto md:ml-0">
                <Link
                  href="/"
                  className="hidden sm:inline text-gray-300 hover:text-gold transition-colors"
                >
                  {t.nav.catalog}
                </Link>
                <Link
                  href="/conta"
                  aria-label={t.account.nav}
                  className="text-gray-300 hover:text-gold transition-colors"
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
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </Link>
                <CartBadge label={t.nav.cart} />
                <span className="h-5 w-px bg-ink-600" aria-hidden />
                <PrefsMenu
                  langHeader={lang === "pt" ? "Idioma" : "Language"}
                  currencyHeader={lang === "pt" ? "Moeda" : "Currency"}
                />
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
                  {t.footer.about}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 text-gold">
                  {t.footer.shop}
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link href="/?categoria=NATIONAL_TEAM" className="hover:text-white">
                      {t.categories.NATIONAL_TEAM}
                    </Link>
                  </li>
                  <li>
                    <Link href="/?categoria=CLUB" className="hover:text-white">
                      {t.categories.CLUB}
                    </Link>
                  </li>
                  <li>
                    <Link href="/?categoria=RETRO" className="hover:text-white">
                      {t.categories.RETRO}
                    </Link>
                  </li>
                  <li>
                    <Link href="/?categoria=LIMITED" className="hover:text-white">
                      {t.categories.LIMITED}
                    </Link>
                  </li>
                  <li>
                    <Link href="/?categoria=JAQUETAS" className="hover:text-white">
                      {t.jacketsCat}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 text-gold">
                  {t.footer.help}
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  {t.footer.helpItems.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                  <li>{t.footer.freeShipping(freeShipAmt)}</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-ink-600">
              <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-gray-500">
                © {new Date().getFullYear()} Acervo do Manto · {t.footer.rights}
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
