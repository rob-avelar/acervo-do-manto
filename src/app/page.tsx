import Link from "next/link";
import {
  listProducts,
  getHighlights,
  getCategoryTiles,
} from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CATEGORY_ORDER } from "@/lib/categories";
import { proxied } from "@/lib/img";
import { getServerCurrency } from "@/lib/currency-server";
import { getServerLang } from "@/lib/lang-server";
import { dict, type Lang } from "@/lib/i18n";
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
  const lang = getServerLang();
  const t = dict[lang];
  const catLabel = (c: ProductCategory) => t.categories[c];

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
    const img = tiles.find((x) => x.category === cat)?.image;
    return img ? proxied(img) : "/banner.png";
  };

  const mkSlide = (
    image: string,
    s: { overline: string; title: string; highlight: string; subtitle: string; cta: string },
    href: string,
  ): Slide => ({
    image,
    overline: s.overline,
    title: s.title,
    highlight: s.highlight,
    subtitle: s.subtitle,
    ctaHref: href,
    ctaLabel: s.cta,
  });

  const slides: Slide[] = isBrowsing
    ? []
    : [
        mkSlide("/banner.png", t.hero.slide1, "/?categoria=NATIONAL_TEAM"),
        mkSlide(imgFor("RETRO" as ProductCategory), t.hero.slide2, "/?categoria=RETRO"),
        mkSlide(imgFor("LIMITED" as ProductCategory), t.hero.slide3, "/?categoria=LIMITED"),
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
                  <strong className="text-gold">{t.seal.title}</strong>
                  <span className="block text-xs text-gray-300">
                    {t.seal.sub}
                  </span>
                </span>
              </div>
            </div>
            <TrustBadges t={t} />
            <CategoryShowcase tiles={tiles} t={t} />
            {highlights.length > 0 && (
              <section className="mt-14">
                <SectionTitle
                  overline={t.highlightsOverline}
                  title={t.highlights}
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {highlights.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      currency={currency}
                      lang={lang}
                    />
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
                ? t.catalog.results(search)
                : category
                  ? catLabel(category)
                  : t.catalog.all}
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              {t.catalog.count(total)}
              {(search || category) && (
                <>
                  {" · "}
                  <Link href="/" className="text-gold hover:underline">
                    {t.catalog.clear}
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Filtros por categoria */}
          <div className="mb-8 flex flex-wrap gap-2">
            <FilterChip
              label={t.catalog.all_filter}
              href="/"
              active={!category && !search}
            />
            {CATEGORY_ORDER.map((cat) => (
              <FilterChip
                key={cat}
                label={catLabel(cat)}
                href={`/?categoria=${cat}`}
                active={category === cat}
              />
            ))}
          </div>

          {items.length === 0 ? (
            <p className="text-gray-400 py-12 text-center">{t.catalog.empty}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={currency}
                  lang={lang}
                />
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
                  {t.catalog.prev}
                </Link>
              )}
              <span className="px-4 py-2 text-gray-400">
                {t.catalog.page(page, pages)}
              </span>
              {page < pages && (
                <Link
                  className="px-4 py-2 border border-ink-600 rounded-lg hover:border-gold"
                  href={buildHref(searchParams, page + 1)}
                >
                  {t.catalog.next}
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

type T = (typeof dict)[Lang];

function TrustBadges({ t }: { t: T }) {
  const badges = [
    { icon: "🚚", ...t.trust.shipping },
    { icon: "💳", ...t.trust.pay },
    { icon: "🔒", ...t.trust.secure },
    { icon: "🔁", ...t.trust.exchange },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
      {badges.map((b) => (
        <div
          key={b.t}
          className="flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-800 p-4"
        >
          <span className="text-2xl">{b.icon}</span>
          <div>
            <p className="text-sm font-semibold">{b.t}</p>
            <p className="text-xs text-gray-400">{b.s}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryShowcase({
  tiles,
  t,
}: {
  tiles: { category: ProductCategory; image: string | null }[];
  t: T;
}) {
  return (
    <section className="mt-14">
      <SectionTitle overline={t.categoriesOverline} title={t.categoriesTitle} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {tiles.map((tile) => (
          <Link
            key={tile.category}
            href={`/?categoria=${tile.category}`}
            className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-ink-600 bg-ink-800"
          >
            {tile.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={proxied(tile.image)}
                alt={t.categories[tile.category]}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <span className="font-display text-xl font-bold">
                {t.categories[tile.category]}
              </span>
              <span className="block text-gold text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {t.seeMore}
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
