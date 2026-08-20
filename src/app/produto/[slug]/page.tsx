import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { formatMoney, discountPercent } from "@/lib/currency";
import { getServerCurrency } from "@/lib/currency-server";
import { CATEGORY_LABELS } from "@/lib/categories";
import { AddToCart } from "@/components/add-to-cart";
import { proxied } from "@/lib/img";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product || !product.active) notFound();

  const currency = getServerCurrency();
  const desconto = discountPercent(
    product.priceCents,
    product.comparePriceCents,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-2 gap-8">
      {/* Galeria */}
      <div className="grid grid-cols-2 gap-2">
        {product.images.map((img, i) => (
          <div
            key={img}
            className={`relative aspect-square bg-ink-700 rounded-xl overflow-hidden border border-ink-600 ${
              i === 0 ? "col-span-2" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proxied(img)}
              alt={`${product.namePt} — foto ${i + 1}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Info */}
      <div>
        <p className="text-sm text-gold/80 uppercase tracking-wide">
          {product.teamName}
        </p>
        <h1 className="font-display text-3xl font-bold mt-1">
          {product.namePt}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {CATEGORY_LABELS[product.category]}
          {product.season ? ` · ${product.season}` : ""}
        </p>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-white">
            {formatMoney(product.priceCents, currency)}
          </span>
          {product.comparePriceCents && (
            <span className="text-lg text-gray-500 line-through">
              {formatMoney(product.comparePriceCents, currency)}
            </span>
          )}
          {desconto && (
            <span className="rounded bg-gold text-ink text-sm font-bold px-2 py-0.5">
              -{desconto}%
            </span>
          )}
        </div>

        <AddToCart
          productId={product.id}
          slug={product.slug}
          name={product.namePt}
          image={product.images[0] ?? ""}
          priceCents={product.priceCents}
          sizes={product.sizes}
        />

        <div className="mt-6 rounded-xl border border-ink-600 bg-ink-800 p-4 text-sm text-gray-300 space-y-1">
          <p>📦 Entrega para todo o Brasil (frete calculado por CEP)</p>
          <p>💳 Pix, boleto e cartão</p>
          <p>🔁 Troca fácil por tamanho</p>
        </div>
      </div>
    </div>
  );
}
