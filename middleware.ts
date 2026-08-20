import { NextResponse, type NextRequest } from "next/server";
import { currencyForCountry } from "@/lib/geo";

// Detecta o país do visitante (header de geolocalização da Vercel) e grava
// a moeda de exibição num cookie que o cliente também consegue ler.
export function middleware(req: NextRequest) {
  // Protege o painel /admin com Basic Auth (usuário: admin, senha: ADMIN_PASSWORD)
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const pass = process.env.ADMIN_PASSWORD;
    const auth = req.headers.get("authorization");
    const expected = pass ? "Basic " + btoa("admin:" + pass) : null;
    if (!expected || auth !== expected) {
      return new NextResponse("Autenticação necessária", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"' },
      });
    }
  }

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
