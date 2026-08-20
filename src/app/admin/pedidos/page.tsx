import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/currency";
import { updateOrder } from "./actions";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  PROCESSING: "Em separação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-300",
  PAID: "bg-blue-500/20 text-blue-300",
  PROCESSING: "bg-purple-500/20 text-purple-300",
  SHIPPED: "bg-cyan-500/20 text-cyan-300",
  DELIVERED: "bg-green-500/20 text-green-300",
  CANCELLED: "bg-red-500/20 text-red-300",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      address: true,
      items: { include: { product: true } },
    },
  });

  const pending = orders.filter(
    (o) => o.status === "PAID" || o.status === "PROCESSING",
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Pedidos</h1>
        <p className="text-sm text-gray-400">
          {orders.length} no total · {pending} para separar/enviar
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-400 py-12 text-center">
          Nenhum pedido ainda.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="border border-ink-600 bg-ink-800 rounded-xl p-5"
            >
              {/* Cabeçalho */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gold">{o.number}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${STATUS_COLORS[o.status]}`}
                  >
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(o.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {/* Cliente + entrega */}
                <div>
                  <p className="text-xs uppercase text-gray-500 mb-1">
                    Cliente
                  </p>
                  <p className="font-medium">{o.customer.name}</p>
                  <p className="text-gray-400">{o.customer.email}</p>
                  {o.customer.phone && (
                    <p className="text-gray-400">📱 {o.customer.phone}</p>
                  )}
                  {o.customer.cpf && (
                    <p className="text-gray-400">CPF: {o.customer.cpf}</p>
                  )}
                  <p className="text-xs uppercase text-gray-500 mt-3 mb-1">
                    Endereço de entrega
                  </p>
                  <p className="text-gray-300">
                    {o.address.street}, {o.address.number}
                    {o.address.complement ? ` — ${o.address.complement}` : ""}
                    <br />
                    {o.address.neighborhood} · {o.address.city}/
                    {o.address.state}
                    <br />
                    CEP {o.address.cep}
                  </p>
                </div>

                {/* Itens */}
                <div>
                  <p className="text-xs uppercase text-gray-500 mb-1">Itens</p>
                  <ul className="space-y-1">
                    {o.items.map((it) => (
                      <li key={it.id} className="flex justify-between gap-2">
                        <span className="text-gray-300">
                          {it.quantity}× {it.product.namePt}{" "}
                          <span className="text-gold">({it.size})</span>
                        </span>
                        <span className="whitespace-nowrap text-gray-400">
                          {formatBRL(it.priceCents * it.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-ink-600 mt-2 pt-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Frete</span>
                      <span>
                        {o.shippingCents === 0
                          ? "Grátis"
                          : formatBRL(o.shippingCents)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-gold">
                        {formatBRL(o.totalCents)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Atualizar status + rastreio */}
              <form
                action={updateOrder}
                className="mt-4 flex flex-wrap items-end gap-3 border-t border-ink-600 pt-4"
              >
                <input type="hidden" name="id" value={o.id} />
                <label className="text-xs text-gray-400">
                  Status
                  <select
                    name="status"
                    defaultValue={o.status}
                    className="block mt-1 rounded-lg border border-ink-600 bg-ink-700 text-white text-sm px-3 py-2"
                  >
                    {Object.entries(STATUS_LABELS).map(([v, label]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-gray-400 flex-1 min-w-[12rem]">
                  Código de rastreio (Correios)
                  <input
                    name="tracking"
                    defaultValue={o.trackingCode ?? ""}
                    placeholder="ex: AA123456789BR"
                    className="block mt-1 w-full rounded-lg border border-ink-600 bg-ink-700 text-white text-sm px-3 py-2"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-lg bg-gold text-ink px-5 py-2 text-sm font-semibold hover:bg-gold-light"
                >
                  Salvar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
