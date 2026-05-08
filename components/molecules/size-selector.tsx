"use client";

import type { ProductVariant } from "@/types/database";
import { isAllowedProductSize } from "@/lib/product-variants";
import { cn, formatPrice } from "@/lib/utils";

type SizeSelectorProps = {
  variants: ProductVariant[];
  selectedVariantId: string;
  onChange: (variant: ProductVariant) => void;
};

export function SizeSelector({ variants, selectedVariantId, onChange }: SizeSelectorProps) {
  const visibleVariants = variants.filter((variant) => isAllowedProductSize(variant.size_ml));

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {visibleVariants.map((variant) => {
        const active = variant.id === selectedVariantId;
        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onChange(variant)}
            className={cn(
              "rounded-2xl border bg-white px-2 py-3 text-center transition hover:border-rawey-gold sm:px-4 sm:text-right",
              active ? "border-rawey-gold shadow-soft" : "border-rawey-line"
            )}
          >
            <span className="block text-xs font-semibold sm:text-sm">{variant.size_ml}ml</span>
            <span className="mt-1 block text-xs text-rawey-muted">{formatPrice(variant.price)}</span>
          </button>
        );
      })}
    </div>
  );
}
