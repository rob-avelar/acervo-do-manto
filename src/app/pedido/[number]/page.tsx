import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: { number: string };
}) {
  const order = await prisma.order.findUnique({
    where: { number: params.number },
    include: {
      items: { include: { product: true } },
      address: true,
      customer: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center py-8">
        <div className="text-4xl mb-2">✅</div>
        <h1 className="font-display text-3xl font-bold">Pedido confirmado!</h1>
        <p className="text-gray-300 mt-1">
          Número do pedido:{" "}
          <strong className="text-gold">{order.number}</strong>
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Enviamos os detalhes para {order.customer.email}. Em breve entramos em
          contato para combinar o pagamento (Pix, boleto ou cartão).
        </p>
      </div>

      <div className="border border-ink-600 bg-ink-800 rounded-xl p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">Itens</h2>
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between text-sm">
            <span className="text-gray-300">
              {it.quantity}× {it.product.namePt} ({it.size})
            </span>
            <span>{formatBRL(it.priceCents * it.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-ink-600 pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span>{formatBRL(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Frete</span>
            <span>
              {order.shippingCents === 0
                ? "Grátis"
                : formatBRL(order.shippingCents)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-gold">{formatBRL(order.totalCents)}</span>
          </div>
        </div>
      </div>

      <div className="border border-ink-600 bg-ink-800 rounded-xl p-5 mt-4 text-sm">
        <h2 className="font-display text-lg font-bold mb-2">Entrega</h2>
        <p className="text-gray-300">
          {order.address.street}, {order.address.number}
          {order.address.complement ? ` — ${order.address.complement}` : ""}
          <br />
          {order.address.neighborhood} · {order.address.city}/
          {order.address.state} · CEP {order.address.cep}
        </p>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-gold underline">
          Voltar ao catálogo
        </Link>
      </div>
    </div>
  );
}
