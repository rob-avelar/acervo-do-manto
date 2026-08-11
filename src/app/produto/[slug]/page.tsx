import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { formatBRL, discountPercent } from "@/lib/currency";
import { CATEGORY_LABELS } from "@/lib/categories";
import { AddToCart } from "@/components/add-to-cart";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product || !product.active) notFound();

  const desconto = discountPercent(
    product.priceCents,
    product.comparePriceCents,
  );

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Galeria */}
      <div className="grid grid-cols-2 gap-2">
        {product.images.map((img, i) => (
          <div
            key={img}
            className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden ${
              i === 0 ? "col-span-2" : ""
            }`}
          >
            <Image
              src={img}
              alt={`${product.namePt} — foto ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Info */}
      <div>
        <p className="text-sm text-gray-500">{product.teamName}</p>
        <h1 className="text-2xl font-bold">{product.namePt}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {CATEGORY_LABELS[product.category]} · {product.league} ·{" "}
          {product.season}
        </p>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-manto">
            {formatBRL(product.priceCents)}
          </span>
          {product.comparePriceCents && (
            <span className="text-lg text-gray-400 line-through">
              {formatBRL(product.comparePriceCents)}
            </span>
          )}
          {desconto && (
            <span className="rounded bg-manto-accent text-black text-sm font-bold px-2 py-0.5">
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

        <div className="mt-6 text-sm text-gray-500 space-y-1">
          <p>📦 Entrega para todo o Brasil (frete calculado por CEP)</p>
          <p>💳 Pix, boleto e cartão</p>
        </div>
      </div>
    </div>
  );
}
