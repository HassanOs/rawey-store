import { createServerClient } from "@/lib/supabase/server";
import { withoutDroppedVariants } from "@/lib/product-variants";
import type { ProductWithVariants } from "@/types/database";

type ProductFilters = {
  search?: string;
  brand?: string;
};

export const PRODUCTS_PAGE_SIZE = 8;

export type ProductsPageResult = {
  products: ProductWithVariants[];
  hasMore: boolean;
};

export async function getProducts(filters: ProductFilters = {}): Promise<ProductWithVariants[]> {
  const supabase = createServerClient();
  let query = supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .neq("variants.size_ml", 1)
    .order("created_at", { ascending: false });

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
  }

  if (filters.brand) {
    query = query.eq("brand", filters.brand);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(withoutDroppedVariants).filter((product) => product.variants.length);
}

export async function getProductsPage(
  filters: ProductFilters = {},
  page = 0,
  limit = PRODUCTS_PAGE_SIZE
): Promise<ProductsPageResult> {
  const supabase = createServerClient();
  const from = page * limit;
  const to = from + limit;
  let query = supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .neq("variants.size_ml", 1)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
  }

  if (filters.brand) {
    query = query.eq("brand", filters.brand);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const products = (data || []).map(withoutDroppedVariants).filter((product) => product.variants.length);

  return {
    products: products.slice(0, limit),
    hasMore: products.length > limit
  };
}

export async function getProduct(id: string): Promise<ProductWithVariants | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .neq("variants.size_ml", 1)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return withoutDroppedVariants(data);
}

export async function getBrands() {
  const products = await getProducts();

  return Array.from(new Set(products.map((item) => item.brand))).filter(Boolean).sort();
}
