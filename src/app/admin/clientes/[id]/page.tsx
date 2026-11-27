import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/order-status";

export const dynamic = "force-dynamic";

const eur = (c: number) => formatMoney(c, "EUR");
const PAID = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function CustomerDetail({
  params,
}: {
  params: { id: string };
}) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
      addresses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!customer) notFound();

  const paid = customer.orders.filter((o) => PAID.includes(o.status));
  const spent = paid.reduce((n, o) => n + o.totalCents, 0);
  const addr = customer.addresses[0];

  const dateFmt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div>
      <Link
        href="/admin/clientes"
        className="text-sm text-gray-400 hover:text-gold"
      >
        ← Clientes
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-bold">{customer.name}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {customer.email}
          {customer.phone ? ` · ${customer.phone}` : ""}
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
          <p className="text-xs text-gray-400">Pedidos</p>
          <p className="text-2xl font-bold text-gold mt-1">
            {customer.orders.length}
          </p>
        </div>
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
          <p className="text-xs text-gray-400">Total gasto</p>
          <p className="text-2xl font-bold text-gold mt-1">{eur(spent)}</p>
        </div>
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
          <p className="text-xs text-gray-400">Cliente desde</p>
          <p className="text-lg font-bold mt-1">
            {dateFmt.format(customer.createdAt)}
          </p>
        </div>
      </div>

      {/* Endereço mais recente */}
      {addr && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-bold mb-2">
            Último endereço
          </h2>
          <p className="text-sm text-gray-300">
            {addr.street}
            {addr.number ? `, ${addr.number}` : ""}
            {addr.complement ? ` — ${addr.complement}` : ""}
            <br />
            {addr.neighborhood ? `${addr.neighborhood} · ` : ""}
            {addr.city}
            {addr.state ? `/${addr.state}` : ""} · {addr.cep} ·{" "}
            <strong>{addr.country}</strong>
          </p>
        </div>
      )}

      {/* Histórico de pedidos */}
      <h2 className="font-display text-lg font-bold mb-3">Histórico de pedidos</h2>
      {customer.orders.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhum pedido ainda.</p>
      ) : (
        <div className="space-y-2">
          {customer.orders.map((o) => (
            <div
              key={o.id}
              className="border border-ink-600 bg-ink-800 rounded-xl p-4 flex items-center justify-between flex-wrap gap-2"
            >
              <div>
                <span className="font-semibold text-gold">{o.number}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {dateFmt.format(o.createdAt)} · {o.items.length} item(s)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    STATUS_COLORS[o.status] ?? "bg-gray-500/20 text-gray-300"
                  }`}
                >
                  {STATUS_LABELS[o.status]?.pt ?? o.status}
                </span>
                <span className="font-semibold">{eur(o.totalCents)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
