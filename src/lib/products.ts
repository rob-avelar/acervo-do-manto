import { unstable_cache } from "next/cache";
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

// Cache das consultas ao catálogo: o banco é consultado no máximo uma vez a
// cada REVALIDATE segundos por variação, em vez de a cada visita. Reduz
// muito o uso do banco (importante no plano gratuito).
const REVALIDATE = 600; // 10 minutos

/** Lista produtos ativos com filtros e paginação. */
export const listProducts = unstable_cache(
  async (filters: ProductFilters = {}) => {
    const { category, team, league, search, page = 1, perPage = 24 } = filters;

    const where: Prisma.StoreProductWhereInput = { active: true };
    if (category) where.category = category;
    if (team) where.teamName = team;
    if (league) where.league = league;
    if (search) {
      where.OR = [
        { namePt: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
        { teamName: { contains: search, mode: "insensitive" } },
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
  },
  ["listProducts"],
  { revalidate: REVALIDATE, tags: ["products"] },
);

export const getProductBySlug = unstable_cache(
  async (slug: string) => prisma.storeProduct.findUnique({ where: { slug } }),
  ["getProductBySlug"],
  { revalidate: REVALIDATE, tags: ["products"] },
);

export const getFeaturedProducts = unstable_cache(
  async (limit = 8) =>
    prisma.storeProduct.findMany({
      where: { active: true, featured: true },
      take: limit,
    }),
  ["getFeaturedProducts"],
  { revalidate: REVALIDATE, tags: ["products"] },
);

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
export const getHighlights = unstable_cache(
  async (limit = 8) => {
    const items = await prisma.storeProduct.findMany({
      where: { active: true, teamName: { in: MARQUEE_TEAMS } },
      distinct: ["teamName"],
      take: limit,
    });
    if (items.length >= 4) return items;
    return prisma.storeProduct.findMany({
      where: { active: true },
      take: limit,
    });
  },
  ["getHighlights"],
  { revalidate: REVALIDATE, tags: ["products"] },
);

/** Uma imagem representativa por categoria (para os blocos da vitrine). */
export const getCategoryTiles = unstable_cache(
  async () => {
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
  },
  ["getCategoryTiles"],
  { revalidate: REVALIDATE, tags: ["products"] },
);
