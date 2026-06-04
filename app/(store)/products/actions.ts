"use server";

import { getProductsPage, PRODUCTS_PAGE_SIZE } from "@/lib/data/products";

export async function loadProductsPage({
  brandSlug,
  page,
  search
}: {
  brandSlug?: string;
  page: number;
  search?: string;
}) {
  return getProductsPage({ search, brandSlug }, page, PRODUCTS_PAGE_SIZE);
}
