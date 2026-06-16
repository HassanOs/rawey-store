"use client";

import type { ProductVariant } from "@/types/database";
import { getProductSprays, isAllowedProductSize } from "@/lib/product-variants";
import { cn, formatPrice } from "@/lib/utils";

type SizeSelectorProps = {
  variants: ProductVariant[];
  selectedVariantId: string;
  onChange: (variant: ProductVariant) => void;
};

export function SizeSelector({ variants, selectedVariantId, onChange }: SizeSelectorProps) {
  const visibleVariants = variants.filter((variant) => isAllowedProductSize(variant.size_ml));

  return (
    <div className="flex gap-2.5">
      {visibleVariants.map((variant) => {
        const active = variant.id === selectedVariantId;
        const sprays = getProductSprays(variant.size_ml);
        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onChange(variant)}
            className={cn(
              "min-w-0 flex-1 rounded-[18px] px-1.5 py-3.5 text-center font-sans transition-all duration-200",
              active
                ? "border-[1.5px] border-rawey-gold bg-gradient-to-b from-[#FFFDF8] to-[#FBF6EC] shadow-[0_12px_28px_rgba(201,169,106,0.2)]"
                : "border-[1.5px] border-[#ECE7DD] bg-white hover:border-rawey-gold"
            )}
          >
            <span dir="ltr" className="block whitespace-nowrap text-[13px] font-bold text-rawey-text">
              {variant.size_ml}ml
            </span>
            {sprays && (
              <span className="mt-0.5 block text-[10.5px] font-semibold text-[#9a9385]">{sprays}</span>
            )}
            <span
              className={cn(
                "mt-1.5 block text-xs font-bold",
                active ? "text-rawey-gold" : "text-rawey-muted"
              )}
            >
              {formatPrice(variant.price)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
