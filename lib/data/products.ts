import { createPublicServerClient } from "@/lib/supabase/server";
import { withoutDroppedVariants } from "@/lib/product-variants";
import type { ProductWithVariants } from "@/types/database";

type ProductFilters = {
  search?: string;
  brandSlug?: string;
};

export const PRODUCTS_PAGE_SIZE = 8;

export type ProductsPageResult = {
  products: ProductWithVariants[];
  hasMore: boolean;
};

export type BrandLink = {
  name: string;
  slug: string;
};

export async function getProducts(filters: ProductFilters = {}): Promise<ProductWithVariants[]> {
  const supabase = createPublicServerClient();
  let query = supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .neq("variants.size_ml", 1)
    .order("created_at", { ascending: false });

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
  }

  if (filters.brandSlug) {
    query = query.eq("brand_slug", filters.brandSlug);
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
  const supabase = createPublicServerClient();
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

  if (filters.brandSlug) {
    query = query.eq("brand_slug", filters.brandSlug);
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

export async function getProductBySlugs(brandSlug: string, productSlug: string): Promise<ProductWithVariants | null> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .neq("variants.size_ml", 1)
    .eq("brand_slug", brandSlug)
    .eq("slug", productSlug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return withoutDroppedVariants(data);
}

export async function getBrandBySlug(slug: string): Promise<BrandLink | null> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("brand, brand_slug")
    .eq("brand_slug", slug)
    .order("brand", { ascending: true })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const brand = data?.[0];
  return brand ? { name: brand.brand, slug: brand.brand_slug } : null;
}

export async function getBrands(): Promise<BrandLink[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase.from("products").select("brand, brand_slug").order("brand", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const brands = new Map<string, BrandLink>();
  for (const product of data || []) {
    if (product.brand && product.brand_slug) {
      brands.set(product.brand_slug, { name: product.brand, slug: product.brand_slug });
    }
  }

  return Array.from(brands.values()).sort((a, b) => a.name.localeCompare(b.name));
}
