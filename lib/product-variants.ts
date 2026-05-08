import type { ProductWithVariants } from "@/types/database";

export const ALLOWED_PRODUCT_SIZES = [3, 5, 10] as const;

export type AllowedProductSize = (typeof ALLOWED_PRODUCT_SIZES)[number];

const PRODUCT_SIZE_SPRAYS: Record<AllowedProductSize, string> = {
  3: '٤٥',
  5: '٧٥',
  10: '١٥٠'
};

export function isAllowedProductSize(sizeMl: number): sizeMl is AllowedProductSize {
  return ALLOWED_PRODUCT_SIZES.includes(sizeMl as AllowedProductSize);
}

export function getProductSizeLabel(sizeMl: number) {
  if (!isAllowedProductSize(sizeMl)) {
    return `${sizeMl}ml`;
  }

  return `${sizeMl}ml (${PRODUCT_SIZE_SPRAYS[sizeMl]} بخة)`;
}

export function withoutDroppedVariants<T extends ProductWithVariants>(product: T): T {
  return {
    ...product,
    variants: [...(product.variants || [])]
      .filter((variant) => isAllowedProductSize(variant.size_ml))
      .sort((a, b) => a.size_ml - b.size_ml)
  };
}
