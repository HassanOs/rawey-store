import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Product } from "@/types/database";

const MAX_SLUG_LENGTH = 96;

export function slugifyText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

export function slugifyProductName(value: string) {
  return slugifyText(value);
}

export function buildBrandSlugBase(brand: string) {
  return slugifyText(brand) || "brand";
}

export function buildProductSlugBase(product: Pick<Product, "brand" | "name">) {
  return slugifyText(product.name) || slugifyText(`${product.brand} ${product.name}`) || "product";
}

export function brandPath(brand: { brand: string; brand_slug?: string | null }) {
  return `/products/${brand.brand_slug || buildBrandSlugBase(brand.brand)}`;
}

export function productPath(
  product: Pick<Product, "brand" | "id" | "name"> & { brand_slug?: string | null; slug?: string | null }
) {
  return `/products/${product.brand_slug || buildBrandSlugBase(product.brand)}/${product.slug || buildProductSlugBase(product) || product.id}`;
}

export async function createUniqueProductSlugs(
  supabase: SupabaseClient<Database>,
  product: Pick<Product, "brand" | "name">,
  excludeProductId?: string
) {
  const brandSlug = buildBrandSlugBase(product.brand);
  const base = buildProductSlugBase(product);

  for (let suffix = 0; suffix < 100; suffix += 1) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .eq("brand_slug", brandSlug)
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.id === excludeProductId) {
      return {
        brandSlug,
        productSlug: candidate
      };
    }
  }

  throw new Error("تعذر إنشاء رابط فريد للمنتج.");
}
