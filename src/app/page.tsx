import Link from "next/link";
import {
  listProducts,
  getHighlights,
  getCategoryTiles,
} from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories";
import { proxied } from "@/lib/img";
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

  const { items, total, pages } = await listProducts({
    category,
    search,
    page,
  });

  // Só mostra a home rica quando NÃO está filtrando/buscando
  const [highlights, tiles] = isBrowsing
    ? [[], []]
    : await Promise.all([getHighlights(8), getCategoryTiles()]);

  return (
    <div>
      {!isBrowsing && <Hero />}

      <div className="mx-auto max-w-6xl px-4">
        {!isBrowsing && (
          <>
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
                    <ProductCard key={p.id} product={p} />
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
                <ProductCard key={p.id} product={p} />
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

function Hero() {
  return (
    <section className="border-b border-ink-600">
      {/* Banner */}
      <div className="w-full bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner.png"
          alt="Acervo do Manto — camisas clássicas de futebol"
          className="w-full h-auto object-cover max-h-[520px]"
        />
      </div>
      {/* Chamada + botões */}
      <div className="mx-auto max-w-6xl px-4 py-8 text-center">
        <p className="text-gold font-semibold tracking-[0.2em] text-xs md:text-sm uppercase">
          Camisas clássicas · Brasil &amp; Europa
        </p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-bold leading-tight">
          Vista a <span className="text-gradient-gold">história</span> do
          futebol
        </h1>
        <p className="mt-3 text-gray-300 max-w-xl mx-auto">
          Milhares de camisas de clubes e seleções, retrôs e edições limitadas.
          Entrega para todo o Brasil.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link
            href="/?categoria=NATIONAL_TEAM"
            className="rounded-lg bg-gold text-ink px-6 py-3 font-semibold hover:bg-gold-light transition-colors"
          >
            Ver seleções
          </Link>
          <Link
            href="/?categoria=RETRO"
            className="rounded-lg border border-gold/50 text-gold px-6 py-3 font-semibold hover:bg-gold/10 transition-colors"
          >
            Ver retrôs
          </Link>
        </div>
      </div>
    </section>
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
