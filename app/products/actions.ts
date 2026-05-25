"use server";

import { getProductsPage, PRODUCTS_PAGE_SIZE } from "@/lib/data/products";

export async function loadProductsPage({
  page,
  search,
  brand
}: {
  page: number;
  search?: string;
  brand?: string;
}) {
  return getProductsPage({ search, brand }, page, PRODUCTS_PAGE_SIZE);
}
