"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { sendStatusEmail } from "@/lib/email";

export async function updateOrder(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  const tracking = String(formData.get("tracking") ?? "").trim();

  // Estado anterior (para saber se o status realmente mudou)
  const before = await prisma.order.findUnique({
    where: { id },
    select: {
      status: true,
      number: true,
      customer: { select: { name: true, email: true } },
      address: { select: { country: true } },
    },
  });

  await prisma.order.update({
    where: { id },
    data: { status, trackingCode: tracking || null },
  });

  // E-mail ao cliente só quando o status muda (ou quando enviado e há rastreio)
  if (before && before.status !== status) {
    try {
      await sendStatusEmail({
        number: before.number,
        customerName: before.customer.name,
        customerEmail: before.customer.email,
        country: before.address.country,
        status,
        trackingCode: tracking || null,
      });
    } catch (e) {
      console.error("Falha ao enviar e-mail de status:", e);
    }
  }

  revalidatePath("/admin/pedidos");
}
