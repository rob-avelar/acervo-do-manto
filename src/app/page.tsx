import Link from "next/link";
import { listProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories";
import type { ProductCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { categoria?: string; busca?: string; pagina?: string };
}) {
  const category = searchParams.categoria as ProductCategory | undefined;
  const search = searchParams.busca;
  const page = Number(searchParams.pagina ?? "1");

  const { items, total, pages } = await listProducts({
    category,
    search,
    page,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {search ? `Resultados para “${search}”` : "Camisas de Futebol"}
        </h1>
        <p className="text-gray-500">
          {total} {total === 1 ? "produto" : "produtos"}
          {search ? (
            <>
              {" "}encontrado{total === 1 ? "" : "s"} ·{" "}
              <a href="/" className="text-manto underline">
                limpar busca
              </a>
            </>
          ) : (
            " · entrega para todo o Brasil"
          )}
        </p>
      </div>

      {/* Filtros por categoria */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip label="Todos" href="/" active={!category} />
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
        <p className="text-gray-500">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-8 flex justify-center gap-2 text-sm">
          {page > 1 && (
            <Link
              className="px-3 py-1 border rounded"
              href={buildHref(searchParams, page - 1)}
            >
              Anterior
            </Link>
          )}
          <span className="px-3 py-1">
            Página {page} de {pages}
          </span>
          {page < pages && (
            <Link
              className="px-3 py-1 border rounded"
              href={buildHref(searchParams, page + 1)}
            >
              Próxima
            </Link>
          )}
        </div>
      )}
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
      className={`rounded-full px-4 py-1.5 text-sm border ${
        active
          ? "bg-manto text-white border-manto"
          : "bg-white text-gray-700 hover:border-manto"
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
