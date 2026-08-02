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
