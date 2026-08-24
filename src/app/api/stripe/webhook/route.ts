import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Recebe eventos do Stripe. Ao confirmar o pagamento, marca o pedido como PAID.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook não configurado" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig ?? "", secret);
  } catch (err) {
    console.error("Assinatura inválida do webhook:", err);
    return NextResponse.json({ error: "assinatura inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderNumber?: string } };
    const orderNumber = session.metadata?.orderNumber;
    if (orderNumber) {
      await prisma.order
        .update({
          where: { number: orderNumber },
          data: { status: "PAID", paymentMethod: "stripe" },
        })
        .catch((e) => console.error("Pedido não encontrado:", orderNumber, e));
    }
  }

  return NextResponse.json({ received: true });
}
