import Link from "next/link";
import type { StoreProduct } from "@prisma/client";
import { formatMoney, discountPercent, type Currency } from "@/lib/currency";
import { proxied } from "@/lib/img";

export function ProductCard({
  product,
  currency = "BRL",
}: {
  product: StoreProduct;
  currency?: Currency;
}) {
  const desconto = discountPercent(
    product.priceCents,
    product.comparePriceCents,
  );

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group block rounded-xl border border-ink-600 bg-ink-800 overflow-hidden hover:border-gold/60 transition-colors"
    >
      <div className="relative aspect-square bg-ink-700">
        {product.images[0] && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={proxied(product.images[0])}
            alt={product.namePt}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {desconto && (
          <span className="absolute top-2 left-2 rounded bg-gold text-ink text-xs font-bold px-2 py-1">
            -{desconto}%
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gold/80 uppercase tracking-wide">
          {product.teamName}
        </p>
        <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] mt-0.5 text-gray-100">
          {product.namePt}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-bold text-white">
            {formatMoney(product.priceCents, currency)}
          </span>
          {product.comparePriceCents && (
            <span className="text-xs text-gray-500 line-through">
              {formatMoney(product.comparePriceCents, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
