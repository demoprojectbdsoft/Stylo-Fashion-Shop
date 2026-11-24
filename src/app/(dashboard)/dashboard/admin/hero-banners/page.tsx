import React from "react";
import { getAdminBanners } from "@/lib/api/banners";
import { getProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { getPublicStores } from "@/lib/api/stores";
import HeroBannersClient from "./HeroBannersClient";

export const dynamic = "force-dynamic";

export default async function AdminHeroBannersPage() {
  const [bannersRes, productsRes, categoriesRes, storesRes] = await Promise.all([
    getAdminBanners(),
    getProducts({ limit: 200 }, { admin: true }),
    getCategories(),
    getPublicStores({ limit: 200 }),
  ]);

  const banners = Array.isArray(bannersRes?.data) ? bannersRes.data : [];
  const products = productsRes?.data?.products ?? [];
  const categories = Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];
  const stores = storesRes?.data?.stores ?? [];

  return (
    <HeroBannersClient
      initialBanners={banners}
      products={products}
      categories={categories}
      stores={stores}
    />
  );
}
