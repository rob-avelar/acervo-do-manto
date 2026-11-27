import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import { getServerCurrency } from "@/lib/currency-server";
import { getServerLang } from "@/lib/lang-server";
import { dict } from "@/lib/i18n";
import { emailEnabled } from "@/lib/email";
import { sizeLabel } from "@/lib/sizes";
import { productName } from "@/lib/product-name";
import {
  STATUS_FLOW,
  statusLabel,
  TRACKING_LABEL,
  type OrderStatusName,
} from "@/lib/order-status";

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
  const hasEmail = emailEnabled();

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
            ? hasEmail
              ? to.paid(order.customer.email)
              : to.paidNoEmail
            : hasEmail
              ? to.pending(order.customer.email)
              : to.pendingNoEmail}
        </p>
      </div>

      {/* Linha do tempo do andamento */}
      {order.status !== "CANCELLED" && (
        <div className="border border-ink-600 bg-ink-800 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between">
            {STATUS_FLOW.map((step, i) => {
              const currentIdx = STATUS_FLOW.indexOf(
                order.status as OrderStatusName,
              );
              const reached = currentIdx >= i && currentIdx >= 0;
              return (
                <div
                  key={step}
                  className="flex-1 flex flex-col items-center text-center relative"
                >
                  {i > 0 && (
                    <span
                      className={`absolute right-1/2 top-3 h-0.5 w-full -z-0 ${
                        reached ? "bg-gold" : "bg-ink-600"
                      }`}
                    />
                  )}
                  <span
                    className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      reached
                        ? "bg-gold text-ink"
                        : "bg-ink-600 text-gray-400"
                    }`}
                  >
                    {reached ? "✓" : i + 1}
                  </span>
                  <span
                    className={`mt-2 text-[0.7rem] ${
                      reached ? "text-gold" : "text-gray-500"
                    }`}
                  >
                    {statusLabel(step, lang)}
                  </span>
                </div>
              );
            })}
          </div>
          {order.trackingCode &&
            (order.status === "SHIPPED" || order.status === "DELIVERED") && (
              <p className="mt-4 text-sm text-center text-gray-300">
                {TRACKING_LABEL[lang]}:{" "}
                <strong className="text-gold">{order.trackingCode}</strong>
              </p>
            )}
        </div>
      )}

      {order.status === "CANCELLED" && (
        <div className="border border-red-500/40 bg-red-500/10 rounded-xl p-4 mb-4 text-center text-sm text-red-200">
          {statusLabel("CANCELLED", lang)}
        </div>
      )}

      <div className="border border-ink-600 bg-ink-800 rounded-xl p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">{to.items}</h2>
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between text-sm">
            <span className="text-gray-300">
              {it.quantity}×{" "}
              {productName(it.product, lang)} ({sizeLabel(it.size, lang)})
              {it.customization && (
                <span className="block text-gold text-xs">
                  {it.customization}
                </span>
              )}
            </span>
            <span>
              {formatMoney(
                (it.priceCents + it.extraCents) * it.quantity,
                currency,
              )}
            </span>
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
