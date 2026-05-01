import { createServerClient } from "@/lib/supabase/server";
import type { ProductWithVariants } from "@/types/database";

type ProductFilters = {
  search?: string;
  brand?: string;
};

export async function getProducts(filters: ProductFilters = {}): Promise<ProductWithVariants[]> {
  const supabase = createServerClient();
  let query = supabase
    .from("products")
    .select("*, variants:product_variants(*)")
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

  return (data || []).map((product) => ({
    ...product,
    variants: [...(product.variants || [])].sort((a, b) => a.size_ml - b.size_ml)
  }));
}

export async function getProduct(id: string): Promise<ProductWithVariants | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return {
    ...data,
    variants: [...(data.variants || [])].sort((a, b) => a.size_ml - b.size_ml)
  };
}

export async function getBrands() {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("products").select("brand").order("brand");

  if (error) {
    throw new Error(error.message);
  }

  return Array.from(new Set((data || []).map((item) => item.brand))).filter(Boolean);
}
