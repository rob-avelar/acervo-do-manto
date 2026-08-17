import { prisma } from "./prisma";
import type { ProductCategory, Prisma } from "@prisma/client";

export interface ProductFilters {
  category?: ProductCategory;
  team?: string;
  league?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

/** Lista produtos ativos com filtros e paginação. */
export async function listProducts(filters: ProductFilters = {}) {
  const { category, team, league, search, page = 1, perPage = 24 } = filters;

  const where: Prisma.StoreProductWhereInput = { active: true };
  if (category) where.category = category;
  if (team) where.teamName = team;
  if (league) where.league = league;
  if (search) {
    where.OR = [
      { namePt: { contains: search, mode: "insensitive" } },
      { teamName: { contains: search, mode: "insensitive" } },
      { league: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.storeProduct.findMany({
      where,
      orderBy: [{ featured: "desc" }, { teamName: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.storeProduct.count({ where }),
  ]);

  return { items, total, page, perPage, pages: Math.ceil(total / perPage) };
}

export async function getProductBySlug(slug: string) {
  return prisma.storeProduct.findUnique({ where: { slug } });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.storeProduct.findMany({
    where: { active: true, featured: true },
    take: limit,
  });
}

// Times de destaque para a vitrine da home.
const MARQUEE_TEAMS = [
  "Flamengo",
  "Brasil",
  "Real Madrid",
  "Corinthians",
  "Barcelona",
  "Palmeiras",
  "Argentina",
  "PSG",
];

/** Uma camisa de cada time de destaque (para a seção "Destaques"). */
export async function getHighlights(limit = 8) {
  const items = await prisma.storeProduct.findMany({
    where: { active: true, teamName: { in: MARQUEE_TEAMS } },
    distinct: ["teamName"],
    take: limit,
  });
  if (items.length >= 4) return items;
  // fallback: primeiros produtos
  return prisma.storeProduct.findMany({ where: { active: true }, take: limit });
}

/** Uma imagem representativa por categoria (para os blocos da vitrine). */
export async function getCategoryTiles() {
  const cats: ProductCategory[] = [
    "NATIONAL_TEAM",
    "CLUB",
    "RETRO",
    "LIMITED",
  ] as ProductCategory[];
  const results = await Promise.all(
    cats.map((c) =>
      prisma.storeProduct.findFirst({
        where: { active: true, category: c, images: { isEmpty: false } },
        select: { images: true },
      }),
    ),
  );
  return cats.map((category, i) => ({
    category,
    image: results[i]?.images[0] ?? null,
  }));
}
