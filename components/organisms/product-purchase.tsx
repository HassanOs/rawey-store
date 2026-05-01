"use client";

import { ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/button";
import { QuantitySelector } from "@/components/molecules/quantity-selector";
import { SizeSelector } from "@/components/molecules/size-selector";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { ProductWithVariants } from "@/types/database";

export function ProductPurchase({ product }: { product: ProductWithVariants }) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const total = useMemo(() => selectedVariant.price * quantity, [selectedVariant.price, quantity]);

  function handleAdd() {
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      brand: product.brand,
      imageUrl: product.image_url,
      sizeMl: selectedVariant.size_ml,
      price: selectedVariant.price,
      quantity
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-rawey-muted">From</p>
          <p className="mt-1 text-2xl font-bold">{formatPrice(total)}</p>
        </div>
        <QuantitySelector value={quantity} onChange={setQuantity} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Choose size</h2>
        <SizeSelector variants={product.variants} selectedVariantId={selectedVariant.id} onChange={setSelectedVariant} />
      </div>

      <Button onClick={handleAdd} className="w-full" size="lg">
        <ShoppingBag className="h-5 w-5" />
        {added ? "Added" : "Add to cart"}
      </Button>
    </div>
  );
}
