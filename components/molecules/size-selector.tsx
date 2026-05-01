"use client";

import type { ProductVariant } from "@/types/database";
import { cn, formatPrice } from "@/lib/utils";

type SizeSelectorProps = {
  variants: ProductVariant[];
  selectedVariantId: string;
  onChange: (variant: ProductVariant) => void;
};

export function SizeSelector({ variants, selectedVariantId, onChange }: SizeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {variants.map((variant) => {
        const active = variant.id === selectedVariantId;
        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onChange(variant)}
            className={cn(
              "rounded-2xl border bg-white px-4 py-3 text-right transition hover:border-rawey-gold",
              active ? "border-rawey-gold shadow-soft" : "border-rawey-line"
            )}
          >
            <span className="block text-sm font-semibold">{variant.size_ml}ml</span>
            <span className="mt-1 block text-xs text-rawey-muted">{formatPrice(variant.price)}</span>
          </button>
        );
      })}
    </div>
  );
}
