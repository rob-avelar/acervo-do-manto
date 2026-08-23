import Link from "next/link";
import {
  listProducts,
  getHighlights,
  getCategoryTiles,
} from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories";
import { proxied } from "@/lib/img";
import { getServerCurrency } from "@/lib/currency-server";
import { HeroCarousel, type Slide } from "@/components/hero-carousel";
import type { ProductCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { categoria?: string; busca?: string; pagina?: string };
}) {
  const category = searchParams.categoria as ProductCategory | undefined;
  const search = searchParams.busca;
  const page = Number(searchParams.pagina ?? "1");
  const isBrowsing = Boolean(category || search || page > 1);
  const currency = getServerCurrency();

  const { items, total, pages } = await listProducts({
    category,
    search,
    page,
  });

  // Só mostra a home rica quando NÃO está filtrando/buscando
  const [highlights, tiles] = isBrowsing
    ? [[], []]
    : await Promise.all([getHighlights(8), getCategoryTiles()]);

  const imgFor = (cat: ProductCategory) => {
    const img = tiles.find((t) => t.category === cat)?.image;
    return img ? proxied(img) : "/banner.png";
  };

  const slides: Slide[] = isBrowsing
    ? []
    : [
        {
          image: "/banner.png",
          overline: "Camisas clássicas · Brasil & Europa",
          title: "Vista a história do futebol",
          highlight: "história",
          subtitle:
            "Milhares de camisas de clubes e seleções, retrôs e edições limitadas. Entrega para todo o Brasil.",
          ctaHref: "/?categoria=NATIONAL_TEAM",
          ctaLabel: "Ver seleções",
        },
        {
          image: imgFor("RETRO" as ProductCategory),
          overline: "Clássicos que marcaram época",
          title: "Retrôs lendários",
          highlight: "lendários",
          subtitle:
            "As camisas históricas dos maiores times e seleções do mundo.",
          ctaHref: "/?categoria=RETRO",
          ctaLabel: "Ver retrôs",
        },
        {
          image: imgFor("LIMITED" as ProductCategory),
          overline: "Copa 2026 & edições especiais",
          title: "Edições limitadas",
          highlight: "limitadas",
          subtitle:
            "Modelos especiais e comemorativos — enquanto durarem os estoques.",
          ctaHref: "/?categoria=LIMITED",
          ctaLabel: "Ver edições limitadas",
        },
      ];

  return (
    <div>
      {!isBrowsing && <HeroCarousel slides={slides} />}

      <div className="mx-auto max-w-6xl px-4">
        {!isBrowsing && (
          <>
            {/* Selo de qualidade */}
            <div className="flex justify-center mt-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-gold/40 bg-ink-800 pl-2 pr-5 py-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold-dark text-ink text-lg">
                  🏆
                </span>
                <span className="text-sm">
                  <strong className="text-gold">
                    Qualidade premium garantida
                  </strong>
                  <span className="block text-xs text-gray-300">
                    Camisas selecionadas · Envio para todo o Brasil
                  </span>
                </span>
              </div>
            </div>
            <TrustBadges />
            <CategoryShowcase tiles={tiles} />
            {highlights.length > 0 && (
              <section className="mt-14">
                <SectionTitle
                  overline="Seleção da casa"
                  title="Destaques"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {highlights.map((p) => (
                    <ProductCard key={p.id} product={p} currency={currency} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Catálogo */}
        <section className="mt-14 mb-10">
          <div className="mb-6">
            <h2 className="font-display text-3xl font-bold">
              {search
                ? `Resultados para “${search}”`
                : category
                  ? CATEGORY_LABELS[category]
                  : "Todas as camisas"}
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              {total} {total === 1 ? "produto" : "produtos"}
              {(search || category) && (
                <>
                  {" · "}
                  <Link href="/" className="text-gold hover:underline">
                    limpar
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Filtros por categoria */}
          <div className="mb-8 flex flex-wrap gap-2">
            <FilterChip label="Todos" href="/" active={!category && !search} />
            {CATEGORY_ORDER.map((cat) => (
              <FilterChip
                key={cat}
                label={CATEGORY_LABELS[cat]}
                href={`/?categoria=${cat}`}
                active={category === cat}
              />
            ))}
          </div>

          {items.length === 0 ? (
            <p className="text-gray-400 py-12 text-center">
              Nenhum produto encontrado.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} currency={currency} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-10 flex justify-center gap-2 text-sm">
              {page > 1 && (
                <Link
                  className="px-4 py-2 border border-ink-600 rounded-lg hover:border-gold"
                  href={buildHref(searchParams, page - 1)}
                >
                  Anterior
                </Link>
              )}
              <span className="px-4 py-2 text-gray-400">
                Página {page} de {pages}
              </span>
              {page < pages && (
                <Link
                  className="px-4 py-2 border border-ink-600 rounded-lg hover:border-gold"
                  href={buildHref(searchParams, page + 1)}
                >
                  Próxima
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TrustBadges() {
  const badges = [
    { icon: "🚚", title: "Entrega Brasil", sub: "Enviamos para todo o país" },
    { icon: "💳", title: "Pix, boleto e cartão", sub: "Pague como preferir" },
    { icon: "🔒", title: "Compra segura", sub: "Seus dados protegidos" },
    { icon: "🔁", title: "Troca fácil", sub: "Tamanho errado? A gente troca" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
      {badges.map((b) => (
        <div
          key={b.title}
          className="flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-800 p-4"
        >
          <span className="text-2xl">{b.icon}</span>
          <div>
            <p className="text-sm font-semibold">{b.title}</p>
            <p className="text-xs text-gray-400">{b.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryShowcase({
  tiles,
}: {
  tiles: { category: ProductCategory; image: string | null }[];
}) {
  return (
    <section className="mt-14">
      <SectionTitle overline="Navegue por" title="Categorias" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {tiles.map((t) => (
          <Link
            key={t.category}
            href={`/?categoria=${t.category}`}
            className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-ink-600 bg-ink-800"
          >
            {t.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={proxied(t.image)}
                alt={CATEGORY_LABELS[t.category]}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <span className="font-display text-xl font-bold">
                {CATEGORY_LABELS[t.category]}
              </span>
              <span className="block text-gold text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver camisas →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionTitle({
  overline,
  title,
}: {
  overline: string;
  title: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className="text-gold text-xs font-semibold uppercase tracking-[0.2em]">
          {overline}
        </p>
        <h2 className="font-display text-3xl font-bold mt-1">{title}</h2>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
        active
          ? "bg-gold text-ink border-gold font-semibold"
          : "border-ink-600 text-gray-300 hover:border-gold hover:text-gold"
      }`}
    >
      {label}
    </Link>
  );
}

function buildHref(
  params: { categoria?: string; busca?: string },
  pagina: number,
) {
  const sp = new URLSearchParams();
  if (params.categoria) sp.set("categoria", params.categoria);
  if (params.busca) sp.set("busca", params.busca);
  sp.set("pagina", String(pagina));
  return `/?${sp.toString()}`;
}
