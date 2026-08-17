"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/currency";
import { proxied } from "@/lib/img";

export default function CartPage() {
  const { items, subtotalCents, setQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 text-center py-24">
        <h1 className="font-display text-3xl font-bold mb-2">
          Seu carrinho está vazio
        </h1>
        <p className="text-gray-400 mb-6">
          Adicione camisas pra começar seu pedido.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-gold text-ink px-6 py-3 font-semibold hover:bg-gold-light"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">Carrinho</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Itens */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.slug}-${item.size}`}
              className="flex gap-4 border border-ink-600 bg-ink-800 rounded-xl p-3"
            >
              <div className="relative w-20 h-20 shrink-0 bg-ink-700 rounded-lg overflow-hidden">
                {item.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={proxied(item.image)}
                    alt={item.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/produto/${item.slug}`}
                  className="text-sm font-medium line-clamp-2 hover:text-gold text-gray-100"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tamanho: {item.size}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-ink-600 rounded-lg">
                    <button
                      type="button"
                      className="px-2 py-1 text-lg leading-none"
                      onClick={() =>
                        setQuantity(item.slug, item.size, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="px-2 py-1 text-lg leading-none"
                      onClick={() =>
                        setQuantity(item.slug, item.size, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-red-500"
                    onClick={() => removeItem(item.slug, item.size)}
                  >
                    Remover
                  </button>
                </div>
              </div>
              <div className="text-right text-sm font-bold text-white whitespace-nowrap">
                {formatBRL(item.priceCents * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="border border-ink-600 bg-ink-800 rounded-xl p-5 h-fit">
          <h2 className="font-display text-xl font-bold mb-4">Resumo</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Subtotal</span>
            <span>{formatBRL(subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-400">Frete</span>
            <span className="text-gray-500">calculado no checkout</span>
          </div>
          <Link
            href="/checkout"
            className="block text-center rounded-lg bg-gold text-ink py-3 font-semibold hover:bg-gold-light transition-colors"
          >
            Finalizar pedido
          </Link>
          <Link
            href="/"
            className="block text-center text-sm text-gray-400 mt-3 hover:text-gold"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
