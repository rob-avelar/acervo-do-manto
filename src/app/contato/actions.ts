"use server";

import { sendContactEmail } from "@/lib/email";

export type ContactState = { error?: string; sent?: boolean };

export async function sendContactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) return { error: "fillAll" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "badEmail" };
  if (message.length < 5) return { error: "fillAll" };

  try {
    await sendContactEmail({ name, email, orderNumber, message });
  } catch (e) {
    console.error("Falha ao enviar contato:", e);
    return { error: "sendFail" };
  }
  return { sent: true };
}
