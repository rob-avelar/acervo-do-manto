import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

// Segredo para assinar a sessão. Definido no Vercel como AUTH_SECRET.
// Fallback só evita quebrar em dev; em produção use SEMPRE a env var.
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me",
);

const COOKIE = "acervo_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Cria a sessão (JWT assinado) e grava no cookie httpOnly. */
export async function createSession(customerId: string) {
  const token = await new SignJWT({ sub: customerId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);

  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSession() {
  cookies().set(COOKIE, "", { path: "/", maxAge: 0 });
}

/** Lê o cookie, valida o JWT e retorna o id do cliente (ou null). */
export async function getSessionCustomerId(): Promise<string | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Retorna o cliente logado (dados básicos) ou null. */
export async function getCurrentCustomer() {
  const id = await getSessionCustomerId();
  if (!id) return null;
  return prisma.customer.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true },
  });
}
