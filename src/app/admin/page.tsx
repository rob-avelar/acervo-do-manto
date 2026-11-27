import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/order-status";

export const dynamic = "force-dynamic";

const eur = (c: number) => formatMoney(c, "EUR");

// Status que contam como "pago" (receita confirmada)
const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export default async function AdminDashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    revenueAll,
    revenueMonth,
    totalOrders,
    customersCount,
    byStatus,
    recent,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { status: { in: [...PAID_STATUSES] } },
    }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: monthStart } },
    }),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { customer: { select: { name: true } } },
    }),
  ]);

  const statusCount: Record<string, number> = {};
  byStatus.forEach((s) => (statusCount[s.status] = s._count._all));

  const dateFmt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  const cards = [
    { label: "Faturamento total", value: eur(revenueAll._sum.totalCents ?? 0) },
    { label: "Faturamento do mês", value: eur(revenueMonth._sum.totalCents ?? 0) },
    { label: "Pedidos", value: String(totalOrders) },
    { label: "Clientes", value: String(customersCount) },
  ];

  const STATUS_ORDER = [
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ] as const;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Dashboard</h1>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-ink-600 bg-ink-800 p-4"
          >
            <p className="text-xs text-gray-400">{c.label}</p>
            <p className="text-2xl font-bold text-gold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Pedidos por status */}
      <h2 className="font-display text-lg font-bold mb-3">Pedidos por status</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {STATUS_ORDER.map((s) => (
          <span
            key={s}
            className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
              STATUS_COLORS[s] ?? "bg-gray-500/20 text-gray-300"
            }`}
          >
            {STATUS_LABELS[s].pt}: {statusCount[s] ?? 0}
          </span>
        ))}
      </div>

      {/* Últimos pedidos */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-bold">Últimos pedidos</h2>
        <Link href="/admin/pedidos" className="text-sm text-gold underline">
          Ver todos
        </Link>
      </div>
      <div className="rounded-xl border border-ink-600 bg-ink-800 overflow-hidden">
        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm p-5">Nenhum pedido ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {recent.map((o) => (
                <tr key={o.number} className="border-b border-ink-600 last:border-0">
                  <td className="px-4 py-3 font-semibold text-gold">
                    {o.number}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{o.customer.name}</td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                    {dateFmt.format(o.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        STATUS_COLORS[o.status] ?? "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {STATUS_LABELS[o.status]?.pt ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {eur(o.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
