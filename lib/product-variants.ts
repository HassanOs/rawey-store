import type { ProductWithVariants } from "@/types/database";

export const ALLOWED_PRODUCT_SIZES = [3, 5, 10] as const;

export type AllowedProductSize = (typeof ALLOWED_PRODUCT_SIZES)[number];

export function isAllowedProductSize(sizeMl: number): sizeMl is AllowedProductSize {
  return ALLOWED_PRODUCT_SIZES.includes(sizeMl as AllowedProductSize);
}

export function withoutDroppedVariants<T extends ProductWithVariants>(product: T): T {
  return {
    ...product,
    variants: [...(product.variants || [])]
      .filter((variant) => isAllowedProductSize(variant.size_ml))
      .sort((a, b) => a.size_ml - b.size_ml)
  };
}
