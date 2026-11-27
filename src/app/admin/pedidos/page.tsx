import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import { updateOrder } from "./actions";
import type { OrderStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// Valores exibidos em euro no admin (armazenados em centavos de BRL).
const eur = (cents: number) => formatMoney(cents, "EUR");

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

const PER_PAGE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; pagina?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const statusFilter = (
    STATUS_LABELS[searchParams.status as OrderStatus] ? searchParams.status : ""
  ) as OrderStatus | "";
  const page = Math.max(1, Number(searchParams.pagina ?? "1") || 1);

  const where: Prisma.OrderWhereInput = {};
  if (statusFilter) where.status = statusFilter;
  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { customer: { is: { name: { contains: q, mode: "insensitive" } } } },
      { customer: { is: { email: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        customer: true,
        address: true,
        items: { include: { product: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (statusFilter) sp.set("status", statusFilter);
    sp.set("pagina", String(p));
    return `/admin/pedidos?${sp.toString()}`;
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
        <h1 className="font-display text-3xl font-bold">Pedidos</h1>
        <p className="text-sm text-gray-400">{total} no total</p>
      </div>

      {/* Filtros */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-3 mb-6 bg-ink-800 border border-ink-600 rounded-xl p-3"
      >
        <label className="text-xs text-gray-400 flex-1 min-w-[12rem]">
          Buscar (nº, nome ou e-mail)
          <input
            name="q"
            defaultValue={q}
            placeholder="AM-... / nome / email"
            className="block mt-1 w-full rounded-lg border border-ink-600 bg-ink-700 text-white text-sm px-3 py-2"
          />
        </label>
        <label className="text-xs text-gray-400">
          Status
          <select
            name="status"
            defaultValue={statusFilter}
            className="block mt-1 rounded-lg border border-ink-600 bg-ink-700 text-white text-sm px-3 py-2"
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-gold text-ink px-5 py-2 text-sm font-semibold hover:bg-gold-light"
        >
          Filtrar
        </button>
        {(q || statusFilter) && (
          <Link
            href="/admin/pedidos"
            className="text-sm text-gray-400 hover:text-gold underline py-2"
          >
            Limpar
          </Link>
        )}
      </form>

      {orders.length === 0 ? (
        <p className="text-gray-400 py-12 text-center">
          Nenhum pedido encontrado.
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
                  <p className="text-xs uppercase text-gray-500 mb-1">Cliente</p>
                  <Link
                    href={`/admin/clientes/${o.customerId}`}
                    className="font-medium text-white hover:text-gold underline"
                  >
                    {o.customer.name}
                  </Link>
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
                    {o.address.street}
                    {o.address.number ? `, ${o.address.number}` : ""}
                    {o.address.complement ? ` — ${o.address.complement}` : ""}
                    <br />
                    {o.address.neighborhood
                      ? `${o.address.neighborhood} · `
                      : ""}
                    {o.address.city}
                    {o.address.state ? `/${o.address.state}` : ""}
                    <br />
                    {o.address.cep} · <strong>{o.address.country}</strong>
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
                          {it.customization && (
                            <span className="block text-xs text-yellow-300">
                              ✎ {it.customization}
                            </span>
                          )}
                        </span>
                        <span className="whitespace-nowrap text-gray-400">
                          {eur((it.priceCents + it.extraCents) * it.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-ink-600 mt-2 pt-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Frete</span>
                      <span>
                        {o.shippingCents === 0 ? "Grátis" : eur(o.shippingCents)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-gold">{eur(o.totalCents)}</span>
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
                  Código de rastreio
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

      {/* Paginação */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              className="text-sm text-gold underline"
            >
              ← Anterior
            </Link>
          ) : (
            <span className="text-sm text-gray-600">← Anterior</span>
          )}
          <span className="text-sm text-gray-400">
            Página {page} de {pages}
          </span>
          {page < pages ? (
            <Link
              href={hrefFor(page + 1)}
              className="text-sm text-gold underline"
            >
              Próxima →
            </Link>
          ) : (
            <span className="text-sm text-gray-600">Próxima →</span>
          )}
        </div>
      )}
    </div>
  );
}
