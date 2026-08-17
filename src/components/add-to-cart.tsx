"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

type Props = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  sizes: string[];
};

export function AddToCart({
  productId,
  slug,
  name,
  image,
  priceCents,
  sizes,
}: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function handleAdd(goToCart: boolean) {
    if (!size) return;
    addItem({ productId, slug, name, image, priceCents, size });
    setAdded(true);
    if (goToCart) router.push("/carrinho");
    else setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div>
      <div className="mt-6">
        <p className="text-sm font-medium mb-2 text-gray-200">
          Tamanho{" "}
          {!size && (
            <span className="text-gold">— selecione um tamanho</span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`min-w-[3rem] text-center rounded-lg border px-3 py-2 text-sm transition-colors ${
                size === s
                  ? "border-gold bg-gold text-ink font-semibold"
                  : "border-ink-600 text-gray-200 hover:border-gold"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          disabled={!size}
          onClick={() => handleAdd(false)}
          className="w-full rounded-lg bg-gold text-ink py-3 font-semibold hover:bg-gold-light transition-colors disabled:opacity-40"
        >
          {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
        </button>
        <button
          type="button"
          disabled={!size}
          onClick={() => handleAdd(true)}
          className="w-full rounded-lg border border-gold/50 text-gold py-3 font-semibold hover:bg-gold/10 transition-colors disabled:opacity-40"
        >
          Comprar agora
        </button>
      </div>
    </div>
  );
}
