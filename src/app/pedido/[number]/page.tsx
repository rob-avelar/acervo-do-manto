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
    <div className="max-w-2xl mx-auto">
      <div className="text-center py-8">
        <div className="text-4xl mb-2">✅</div>
        <h1 className="text-2xl font-bold">Pedido confirmado!</h1>
        <p className="text-gray-500 mt-1">
          Número do pedido: <strong>{order.number}</strong>
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Enviamos os detalhes para {order.customer.email}. Em breve entramos em
          contato para combinar o pagamento (Pix, boleto ou cartão).
        </p>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="font-bold">Itens</h2>
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between text-sm">
            <span className="text-gray-600">
              {it.quantity}× {it.product.namePt} ({it.size})
            </span>
            <span>{formatBRL(it.priceCents * it.quantity)}</span>
          </div>
        ))}
        <div className="border-t pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatBRL(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Frete</span>
            <span>
              {order.shippingCents === 0
                ? "Grátis"
                : formatBRL(order.shippingCents)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-manto">{formatBRL(order.totalCents)}</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 mt-4 text-sm">
        <h2 className="font-bold mb-2">Entrega</h2>
        <p className="text-gray-600">
          {order.address.street}, {order.address.number}
          {order.address.complement ? ` — ${order.address.complement}` : ""}
          <br />
          {order.address.neighborhood} · {order.address.city}/
          {order.address.state} · CEP {order.address.cep}
        </p>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-manto underline">
          Voltar ao catálogo
        </Link>
      </div>
    </div>
  );
}
