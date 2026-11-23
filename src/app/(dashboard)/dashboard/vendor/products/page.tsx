import React from "react";
import { getRequiredRole } from "@/lib/core/session";
import { asProductList, getMyProducts } from "@/lib/api/vendorProducts";
import { getCategories } from "@/lib/api/categories";
import { getSubCategories } from "@/lib/api/subCategories";
import type { VendorProductListResult } from "@/types/vendor";
import type { Category, SubCategory } from "@/types";
import VendorProductsClient from "./VendorProductsClient";

export const dynamic = "force-dynamic";

/**
 * The vendor's catalogue.
 *
 * The plan usage and the rows come from one read, so the "x / y used" line can
 * never describe a different moment than the table beneath it.
 */
interface VendorProductsPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    /** The same in/out stock reading the admin desk uses. */
    stock?: string;
    sort?: string;
    page?: string;
    limit?: string;
    edit?: string;
  }>;
}

export default async function VendorProductsPage({ searchParams }: VendorProductsPageProps) {
  await getRequiredRole("vendor");

  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);
  const requestedLimit = Number(params?.limit);
  const limit = [10, 20, 50].includes(requestedLimit) ? requestedLimit : 10;
  const status = params?.status || "all";
  const search = params?.search?.trim() || "";
  // Only the values the API accepts; anything else falls back to the default
  // rather than reaching Mongo as an unknown key.
  const stockParam = params?.stock;
  const stock = stockParam === "in" || stockParam === "out" ? stockParam : "all";
  const sortParam = params?.sort;
  const sort =
    sortParam === "oldest" || sortParam === "price_asc" || sortParam === "price_desc"
      ? sortParam
      : "newest";
  const editId = params?.edit;

  const [resultRes, categoriesRes, subCategoriesRes] = await Promise.all([
    getMyProducts({ status, search, stock, sort, page, limit }),
    getCategories(),
    getSubCategories(),
  ]);

  const result: VendorProductListResult | null = asProductList(resultRes);

  const categories: Category[] = Array.isArray(categoriesRes?.data)
    ? categoriesRes.data
    : Array.isArray(categoriesRes)
      ? categoriesRes
      : [];

  const subCategories: SubCategory[] = Array.isArray(subCategoriesRes?.data)
    ? subCategoriesRes.data
    : Array.isArray(subCategoriesRes)
      ? subCategoriesRes
      : [];

  const fallbackPlan = {
    id: "free" as const,
    name: "Free",
    maxProducts: 10,
    used: 0,
    isLive: false,
    effectiveUntil: null,
  };

  return (
    <VendorProductsClient
      products={result?.products ?? []}
      typeCounts={result?.typeCounts ?? {}}
      pagination={result?.pagination ?? { page, limit, total: 0, totalPages: 1 }}
      plan={result?.plan ?? fallbackPlan}
      filters={{ status, search, stock, sort }}
      categories={categories.filter((c) => c.isActive !== false)}
      subcategories={subCategories}
      initialEditId={editId}
    />
  );
}
