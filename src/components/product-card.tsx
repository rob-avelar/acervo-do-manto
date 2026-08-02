import Link from "next/link";
import Image from "next/image";
import type { StoreProduct } from "@prisma/client";
import { formatBRL, discountPercent } from "@/lib/currency";

export function ProductCard({ product }: { product: StoreProduct }) {
  const desconto = discountPercent(
    product.priceCents,
    product.comparePriceCents,
  );

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group block rounded-lg border bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-gray-100">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.namePt}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform"
          />
        )}
        {desconto && (
          <span className="absolute top-2 left-2 rounded bg-manto-accent text-black text-xs font-bold px-2 py-1">
            -{desconto}%
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500">{product.teamName}</p>
        <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
          {product.namePt}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-bold text-manto">
            {formatBRL(product.priceCents)}
          </span>
          {product.comparePriceCents && (
            <span className="text-xs text-gray-400 line-through">
              {formatBRL(product.comparePriceCents)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
