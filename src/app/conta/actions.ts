"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  clearSession,
} from "@/lib/auth";

export type AuthState = { error?: string };

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
