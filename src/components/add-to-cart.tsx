"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { sizeLabel } from "@/lib/sizes";
import { formatMoney, type Currency } from "@/lib/currency";
import {
  ADDON_CENTS,
  extraCentsFor,
  type Customization,
} from "@/lib/customization";
import { dict, type Lang } from "@/lib/i18n";

const PATCHES = [
  "Champions League",
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Brasileirão",
  "Libertadores",
  "Copa do Mundo",
];

type Props = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  sizes: string[];
  lang: Lang;
  currency: Currency;
  labels: {
    size: string;
    selectSize: string;
    add: string;
    added: string;
    buyNow: string;
  };
};

export function AddToCart({
  productId,
  slug,
  name,
  image,
  priceCents,
  sizes,
  lang,
  currency,
  labels,
}: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const t = dict[lang].product.custom;
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const [custName, setCustName] = useState("");
  const [custNumber, setCustNumber] = useState("");
  const [patch, setPatch] = useState("");

  const customization: Customization = useMemo(
    () => ({
      name: custName.trim() || undefined,
      number: custNumber.trim() || undefined,
      patch: patch || undefined,
    }),
    [custName, custNumber, patch],
  );
  const extraCents = extraCentsFor(customization);
  const unitTotal = priceCents + extraCents;

  function handleAdd(goToCart: boolean) {
    if (!size) return;
    addItem({
      productId,
      slug,
      name,
      image,
      priceCents,
      size,
      extraCents,
      customization: extraCents > 0 ? customization : undefined,
    });
    setAdded(true);
    if (goToCart) router.push("/carrinho");
    else setTimeout(() => setAdded(false), 2000);
  }

  const input =
    "w-full rounded-lg border border-ink-600 bg-ink-800 text-white placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:border-gold";

  return (
    <div>
      <div className="mt-6">
        <p className="text-sm font-medium mb-2 text-gray-200">
          {labels.size}{" "}
          {!size && <span className="text-gold">{labels.selectSize}</span>}
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
              {sizeLabel(s, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Personalização */}
      <div className="mt-6 rounded-xl border border-ink-600 bg-ink-800 p-4">
        <p className="text-sm font-semibold mb-3">✨ {t.title}</p>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-gray-400">
              {t.name} (+{formatMoney(ADDON_CENTS.name, currency)})
            </span>
            <input
              className={input}
              placeholder={t.namePh}
              maxLength={14}
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-400">
              {t.number} (+{formatMoney(ADDON_CENTS.number, currency)})
            </span>
            <input
              className={input}
              placeholder={t.numberPh}
              maxLength={3}
              inputMode="numeric"
              value={custNumber}
              onChange={(e) =>
                setCustNumber(e.target.value.replace(/\D/g, ""))
              }
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-400">
              {t.patch} (+{formatMoney(ADDON_CENTS.patch, currency)})
            </span>
            <select
              className={input}
              value={patch}
              onChange={(e) => setPatch(e.target.value)}
            >
              <option value="">{t.none}</option>
              {PATCHES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        {extraCents > 0 && (
          <p className="mt-3 text-sm text-gold">
            {t.extra}: +{formatMoney(extraCents, currency)}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-sm text-gray-400">Total:</span>
        <span className="text-xl font-bold text-white">
          {formatMoney(unitTotal, currency)}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={!size}
          onClick={() => handleAdd(false)}
          className="w-full rounded-lg bg-gold text-ink py-3 font-semibold hover:bg-gold-light transition-colors disabled:opacity-40"
        >
          {added ? labels.added : labels.add}
        </button>
        <button
          type="button"
          disabled={!size}
          onClick={() => handleAdd(true)}
          className="w-full rounded-lg border border-gold/50 text-gold py-3 font-semibold hover:bg-gold/10 transition-colors disabled:opacity-40"
        >
          {labels.buyNow}
        </button>
      </div>
    </div>
  );
}
