"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe, hasStripe } from "@/lib/stripe";
import { targetCents, type Currency } from "@/lib/currency";

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

export type StripeResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

// Frete simples por enquanto: grátis acima de R$300, senão R$24,90.
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

// Cria cliente + endereço + pedido (status PENDING) a partir do input.
async function persistOrder(input: CheckoutInput) {
  if (!input.items.length) throw new Error("Carrinho vazio.");
  if (!input.customer.email || !input.customer.name)
    throw new Error("Preencha nome e e-mail.");

  // Recalcula preços a partir do banco (nunca confia no cliente)
  const ids = [...new Set(input.items.map((i) => i.productId))];
  const products = await prisma.storeProduct.findMany({
    where: { id: { in: ids } },
    select: { id: true, priceCents: true, namePt: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items = input.items.map((i) => {
    const p = byId.get(i.productId);
    if (!p) throw new Error("Produto inválido no carrinho.");
    return {
      productId: i.productId,
      size: i.size,
      quantity: Math.max(1, i.quantity),
      priceCents: p.priceCents,
      name: p.namePt,
    };
  });

  const subtotalCents = items.reduce(
    (n, i) => n + i.priceCents * i.quantity,
    0,
  );
  const shippingCents = shippingFor(subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  const email = input.customer.email.trim().toLowerCase();
  const customer = await prisma.customer.upsert({
    where: { email },
    update: {
      name: input.customer.name.trim(),
      phone: input.customer.phone.trim() || null,
      cpf: input.customer.cpf.trim() || null,
    },
    create: {
      email,
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
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          quantity: i.quantity,
          priceCents: i.priceCents,
        })),
      },
    },
  });

  return { order, items, customer, subtotalCents, shippingCents };
}

// Fluxo manual (Brasil, sem pagamento online por enquanto).
export async function createOrder(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  try {
    const { order } = await persistOrder(input);
    return { ok: true, orderNumber: order.number };
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Erro ao criar o pedido.";
    return { ok: false, error: msg };
  }
}

function siteOrigin() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

// Fluxo internacional (Stripe): cria o pedido e uma sessão de pagamento.
export async function createStripeCheckout(
  input: CheckoutInput,
  currency: Currency,
): Promise<StripeResult> {
  try {
    if (!hasStripe())
      return { ok: false, error: "Pagamento internacional indisponível." };

    const { order, items, customer, shippingCents } = await persistOrder(input);
    const origin = siteOrigin();
    const cur = currency.toLowerCase();

    const line_items = items.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: cur,
        unit_amount: targetCents(i.priceCents, currency),
        product_data: { name: `${i.name} (${i.size})` },
      },
    }));

    if (shippingCents > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: cur,
          unit_amount: targetCents(shippingCents, currency),
          product_data: { name: "Frete" },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: customer.email,
      metadata: { orderNumber: order.number },
      success_url: `${origin}/pedido/${order.number}?status=sucesso`,
      cancel_url: `${origin}/checkout?status=cancelado`,
    });

    if (!session.url)
      return { ok: false, error: "Não foi possível iniciar o pagamento." };
    return { ok: true, url: session.url };
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Erro ao iniciar o pagamento.";
    return { ok: false, error: msg };
  }
}
