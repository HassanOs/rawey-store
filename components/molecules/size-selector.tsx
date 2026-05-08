"use client";

import type { ProductVariant } from "@/types/database";
import { getProductSizeLabel, isAllowedProductSize } from "@/lib/product-variants";
import { cn, formatPrice } from "@/lib/utils";

type SizeSelectorProps = {
  variants: ProductVariant[];
  selectedVariantId: string;
  onChange: (variant: ProductVariant) => void;
};

export function SizeSelector({ variants, selectedVariantId, onChange }: SizeSelectorProps) {
  const visibleVariants = variants.filter((variant) => isAllowedProductSize(variant.size_ml));

  return (
    <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2 sm:gap-3">
      {visibleVariants.map((variant) => {
        const active = variant.id === selectedVariantId;
        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onChange(variant)}
            className={cn(
              "min-w-0 rounded-2xl border bg-white px-1.5 py-3 text-center transition hover:border-rawey-gold sm:px-4 sm:text-right",
              active ? "border-rawey-gold shadow-soft" : "border-rawey-line"
            )}
          >
            <span dir="ltr" className="block whitespace-nowrap text-[11px] font-semibold leading-4 sm:text-sm">
              {getProductSizeLabel(variant.size_ml)}
            </span>
            <span className="mt-1 block text-xs text-rawey-muted">{formatPrice(variant.price)}</span>
          </button>
        );
      })}
    </div>
  );
}
