import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import { getServerCurrency } from "@/lib/currency-server";
import { getServerLang } from "@/lib/lang-server";
import { dict } from "@/lib/i18n";

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
  const currency = getServerCurrency();
  const lang = getServerLang();
  const t = dict[lang];
  const to = t.order;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center py-8">
        <div className="text-4xl mb-2">✅</div>
        <h1 className="font-display text-3xl font-bold">{to.confirmed}</h1>
        <p className="text-gray-300 mt-1">
          {to.number} <strong className="text-gold">{order.number}</strong>
        </p>
        <p className="text-gray-400 text-sm mt-2">
          {order.status === "PAID"
            ? to.paid(order.customer.email)
            : to.pending(order.customer.email)}
        </p>
      </div>

      <div className="border border-ink-600 bg-ink-800 rounded-xl p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">{to.items}</h2>
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between text-sm">
            <span className="text-gray-300">
              {it.quantity}×{" "}
              {lang === "en" ? it.product.nameEn : it.product.namePt} ({it.size})
            </span>
            <span>{formatMoney(it.priceCents * it.quantity, currency)}</span>
          </div>
        ))}
        <div className="border-t border-ink-600 pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">{t.cart.subtotal}</span>
            <span>{formatMoney(order.subtotalCents, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">{t.cart.shipping}</span>
            <span>
              {order.shippingCents === 0
                ? t.checkout.free
                : formatMoney(order.shippingCents, currency)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-base">
            <span>{t.checkout.total}</span>
            <span className="text-gold">{formatMoney(order.totalCents, currency)}</span>
          </div>
        </div>
      </div>

      <div className="border border-ink-600 bg-ink-800 rounded-xl p-5 mt-4 text-sm">
        <h2 className="font-display text-lg font-bold mb-2">{to.delivery}</h2>
        <p className="text-gray-300">
          {order.address.street}
          {order.address.number ? `, ${order.address.number}` : ""}
          {order.address.complement ? ` — ${order.address.complement}` : ""}
          <br />
          {order.address.neighborhood ? `${order.address.neighborhood} · ` : ""}
          {order.address.city}
          {order.address.state ? `/${order.address.state}` : ""} ·{" "}
          {order.address.cep} · {order.address.country}
        </p>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-gold underline">
          {to.back}
        </Link>
      </div>
    </div>
  );
}
