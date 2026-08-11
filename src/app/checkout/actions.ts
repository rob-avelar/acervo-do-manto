"use server";

import { prisma } from "@/lib/prisma";

export type CheckoutItem = {
  productId: string;
  size: string;
  quantity: number;
  priceCents: number;
};

export type CheckoutInput = {
  customer: { name: string; email: string; phone: string; cpf: string };
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  items: CheckoutItem[];
};

export type CheckoutResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

// Frete simples por enquanto: grátis acima de R$300, senão R$24,90.
// (substituir por cálculo real por CEP depois)
function shippingFor(subtotalCents: number) {
  return subtotalCents >= 30000 ? 0 : 2490;
}

function orderNumber() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `AM-${t}${r}`;
}

export async function createOrder(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  try {
    if (!input.items.length) return { ok: false, error: "Carrinho vazio." };
    if (!input.customer.email || !input.customer.name)
      return { ok: false, error: "Preencha nome e e-mail." };

    // Recalcula preços a partir do banco (nunca confia no cliente)
    const ids = [...new Set(input.items.map((i) => i.productId))];
    const products = await prisma.storeProduct.findMany({
      where: { id: { in: ids } },
      select: { id: true, priceCents: true },
    });
    const priceById = new Map(products.map((p) => [p.id, p.priceCents]));

    const items = input.items.map((i) => {
      const priceCents = priceById.get(i.productId);
      if (priceCents == null) throw new Error("Produto inválido no carrinho.");
      return {
        productId: i.productId,
        size: i.size,
        quantity: Math.max(1, i.quantity),
        priceCents,
      };
    });

    const subtotalCents = items.reduce(
      (n, i) => n + i.priceCents * i.quantity,
      0,
    );
    const shippingCents = shippingFor(subtotalCents);
    const totalCents = subtotalCents + shippingCents;

    // Upsert do cliente por e-mail
    const customer = await prisma.customer.upsert({
      where: { email: input.customer.email.trim().toLowerCase() },
      update: {
        name: input.customer.name.trim(),
        phone: input.customer.phone.trim() || null,
        cpf: input.customer.cpf.trim() || null,
      },
      create: {
        email: input.customer.email.trim().toLowerCase(),
        name: input.customer.name.trim(),
        phone: input.customer.phone.trim() || null,
        cpf: input.customer.cpf.trim() || null,
      },
    });

    const address = await prisma.address.create({
      data: {
        customerId: customer.id,
        cep: input.address.cep.trim(),
        street: input.address.street.trim(),
        number: input.address.number.trim(),
        complement: input.address.complement.trim() || null,
        neighborhood: input.address.neighborhood.trim(),
        city: input.address.city.trim(),
        state: input.address.state.trim().toUpperCase(),
      },
    });

    const order = await prisma.order.create({
      data: {
        number: orderNumber(),
        customerId: customer.id,
        addressId: address.id,
        subtotalCents,
        shippingCents,
        totalCents,
        status: "PENDING",
        items: { create: items },
      },
    });

    return { ok: true, orderNumber: order.number };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro ao criar o pedido. Tente novamente." };
  }
}
