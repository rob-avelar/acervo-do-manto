import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/auth";
import { logoutAction } from "./actions";
import { getServerLang } from "@/lib/lang-server";
import { getServerCurrency } from "@/lib/currency-server";
import { formatMoney } from "@/lib/currency";
import { dict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { pt: string; en: string }> = {
  PENDING: { pt: "Aguardando pagamento", en: "Awaiting payment" },
  PAID: { pt: "Pago", en: "Paid" },
  PROCESSING: { pt: "Em preparação", en: "Processing" },
  SHIPPED: { pt: "Enviado", en: "Shipped" },
  DELIVERED: { pt: "Entregue", en: "Delivered" },
  CANCELLED: { pt: "Cancelado", en: "Cancelled" },
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-300",
  PAID: "bg-emerald-500/20 text-emerald-300",
  PROCESSING: "bg-blue-500/20 text-blue-300",
  SHIPPED: "bg-cyan-500/20 text-cyan-300",
  DELIVERED: "bg-green-600/20 text-green-300",
  CANCELLED: "bg-red-500/20 text-red-300",
};

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/conta/entrar");

  const lang = getServerLang();
  const currency = getServerCurrency();
  const a = dict[lang].account;

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    select: {
      number: true,
      createdAt: true,
      status: true,
      totalCents: true,
    },
  });

  const dateFmt = new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {a.hello(customer.name)}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{customer.email}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-gray-300 hover:text-gold underline"
          >
            {a.logout}
          </button>
        </form>
      </div>

      <h2 className="font-display text-xl font-bold mb-4">{a.myOrders}</h2>

      {orders.length === 0 ? (
        <div className="border border-ink-600 bg-ink-800 rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-4">{a.noOrders}</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-gold text-ink font-semibold px-5 py-2.5 hover:brightness-110 transition"
          >
            {a.seeCatalog}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.number}
              href={`/pedido/${o.number}`}
              className="block border border-ink-600 bg-ink-800 rounded-xl p-4 hover:border-gold/50 transition"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="font-semibold text-gold">{o.number}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {dateFmt.format(o.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      STATUS_COLORS[o.status] ?? "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {STATUS_LABELS[o.status]?.[lang] ?? o.status}
                  </span>
                  <span className="font-semibold">
                    {formatMoney(o.totalCents, currency)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
