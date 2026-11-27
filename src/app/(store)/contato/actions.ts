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
  const subject = String(formData.get("subject") ?? "general").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) return { error: "fillAll" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "badEmail" };
  if (message.length < 5) return { error: "fillAll" };

  // Mensagens sobre pedido/troca exigem o número do pedido
  const needsOrder = subject === "order" || subject === "exchange";
  if (needsOrder && !orderNumber) return { error: "orderRequired" };

  const SUBJECT_LABEL: Record<string, string> = {
    general: "Dúvida geral",
    order: "Sobre um pedido",
    exchange: "Troca ou devolução",
    other: "Outro",
  };

  try {
    await sendContactEmail({
      name,
      email,
      orderNumber,
      message,
      subject: SUBJECT_LABEL[subject] ?? subject,
    });
  } catch (e) {
    console.error("Falha ao enviar contato:", e);
    return { error: "sendFail" };
  }
  return { sent: true };
}
