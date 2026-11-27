import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { getServerLang } from "@/lib/lang-server";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: "Acervo do Manto — Football Shirts",
  description:
    "Club and national team football shirts, retros and limited editions. Shipping across Europe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = getServerLang();

  return (
    <html
      lang={
        lang === "pt" ? "pt-BR" : lang === "es" ? "es" : lang === "nl" ? "nl" : "en"
      }
      className={`${inter.variable} ${oswald.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-ink text-white font-sans">
        {children}
      </body>
    </html>
  );
}
