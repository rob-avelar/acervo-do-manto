"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";

export async function updateOrder(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  const tracking = String(formData.get("tracking") ?? "").trim();

  await prisma.order.update({
    where: { id },
    data: { status, trackingCode: tracking || null },
  });

  revalidatePath("/admin/pedidos");
}
