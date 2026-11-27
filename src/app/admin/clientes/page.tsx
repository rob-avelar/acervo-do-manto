import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";

export const dynamic = "force-dynamic";

const eur = (c: number) => formatMoney(c, "EUR");
const PAID = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function AdminClientes() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      orders: { select: { totalCents: true, status: true } },
    },
  });

  const rows = customers.map((c) => {
    const paid = c.orders.filter((o) => PAID.includes(o.status));
    const spent = paid.reduce((n, o) => n + o.totalCents, 0);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      orders: c.orders.length,
      spent,
    };
  });

  const dateFmt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="font-display text-3xl font-bold">Clientes</h1>
        <span className="text-sm text-gray-400">{rows.length} cadastrados</span>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-400">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <div className="rounded-xl border border-ink-600 bg-ink-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-ink-600">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium text-center">Pedidos</th>
                <th className="px-4 py-3 font-medium text-right">Total gasto</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-ink-600 last:border-0 hover:bg-ink-700/40"
                >
                  <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {c.email}
                    {c.phone ? (
                      <span className="block text-xs text-gray-500">
                        {c.phone}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {c.orders}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gold">
                    {eur(c.spent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
