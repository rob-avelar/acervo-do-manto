import { NextRequest } from "next/server";

export const runtime = "edge";

// Proxy de imagens do Yupoo. O CDN do Yupoo (EdgeOne/Tencent) bloqueia
// hotlink direto — só serve a imagem quando o cabeçalho Referer aponta para
// o próprio site do fornecedor. Este proxy busca a imagem no servidor com
// o Referer correto e a reentrega ao navegador do cliente.

const ALLOWED_HOST = "photo.yupoo.com";
const YUPOO_REFERER = "https://13288233939.x.yupoo.com/";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) return new Response("missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(u);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  // Só permite imagens do Yupoo (evita proxy aberto)
  if (target.hostname !== ALLOWED_HOST) {
    return new Response("host not allowed", { status: 403 });
  }

  const upstream = await fetch(target.toString(), {
    headers: {
      Referer: YUPOO_REFERER,
      "User-Agent": UA,
      Accept: "image/avif,image/webp,image/jpeg,image/png,*/*",
    },
    // cache no edge da Vercel
    cache: "force-cache",
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("upstream error", { status: 502 });
  }

  const contentType =
    upstream.headers.get("content-type") ?? "image/jpeg";

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // cache agressivo: as imagens não mudam
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
