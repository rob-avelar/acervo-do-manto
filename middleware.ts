import { NextResponse, type NextRequest } from "next/server";
import { currencyForCountry } from "@/lib/geo";

// Detecta o país do visitante (header de geolocalização da Vercel) e grava
// a moeda de exibição num cookie que o cliente também consegue ler.
export function middleware(req: NextRequest) {
  const country =
    req.headers.get("x-vercel-ip-country") ?? req.geo?.country ?? "BR";
  const currency = currencyForCountry(country);

  const res = NextResponse.next();
  res.cookies.set("cur", currency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  // roda em páginas, ignora assets e API
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
