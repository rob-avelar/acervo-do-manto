"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  clearSession,
  createResetToken,
  verifyResetToken,
} from "@/lib/auth";
import { sendPasswordReset } from "@/lib/email";
import { getServerLang } from "@/lib/lang-server";

export type AuthState = { error?: string };
export type ResetState = { error?: string; sent?: boolean };

// Cria conta nova — ou "reivindica" uma conta de convidado criada num pedido
// anterior com o mesmo e-mail (nesse caso só define a senha).
export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) return { error: "fillAll" };
  if (password.length < 6) return { error: "shortPassword" };

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing?.passwordHash) return { error: "emailInUse" };

  const passwordHash = await hashPassword(password);
  const customer = existing
    ? await prisma.customer.update({
        where: { email },
        data: { passwordHash, name: existing.name || name },
      })
    : await prisma.customer.create({ data: { name, email, passwordHash } });

  await createSession(customer.id);
  redirect("/conta");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "fillAll" };

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (
    !customer ||
    !customer.passwordHash ||
    !(await verifyPassword(password, customer.passwordHash))
  ) {
    return { error: "wrongLogin" };
  }

  await createSession(customer.id);
  redirect("/conta");
}

export async function logoutAction() {
  clearSession();
  redirect("/");
}

function siteOrigin() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

// Pede o link de redefinição. Nunca revela se o e-mail existe (segurança).
export async function requestResetAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "fillAll" };

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (customer?.passwordHash) {
    try {
      const token = await createResetToken(customer.id);
      const link = `${siteOrigin()}/conta/redefinir?token=${token}`;
      await sendPasswordReset(
        customer.email,
        customer.name,
        link,
        getServerLang(),
      );
    } catch (e) {
      console.error("Falha ao enviar e-mail de reset:", e);
    }
  }
  // Sempre "enviado" (não vaza existência do e-mail)
  return { sent: true };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "fillAll" };
  if (password.length < 6) return { error: "shortPassword" };

  const customerId = await verifyResetToken(token);
  if (!customerId) return { error: "invalidToken" };

  const passwordHash = await hashPassword(password);
  await prisma.customer.update({
    where: { id: customerId },
    data: { passwordHash },
  });
  await createSession(customerId);
  redirect("/conta");
}
