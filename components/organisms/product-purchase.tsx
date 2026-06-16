"use client";

import { ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/button";
import { QuantitySelector } from "@/components/molecules/quantity-selector";
import { SizeSelector } from "@/components/molecules/size-selector";
import { useToast } from "@/components/organisms/toast-provider";
import { isAllowedProductSize } from "@/lib/product-variants";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { ProductWithVariants } from "@/types/database";

export function ProductPurchase({ product }: { product: ProductWithVariants }) {
  const variants = product.variants.filter((variant) => isAllowedProductSize(variant.size_ml));
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const total = useMemo(() => selectedVariant.price * quantity, [selectedVariant.price, quantity]);

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      brandSlug: product.brand_slug,
      variantId: selectedVariant.id,
      name: product.name,
      brand: product.brand,
      imageUrl: product.image_url,
      sizeMl: selectedVariant.size_ml,
      price: selectedVariant.price,
      quantity
    });
    setAdded(true);
    showToast({
      title: "تمت إضافة المنتج إلى السلة",
      description: `${product.brand} ${product.name} - ${selectedVariant.size_ml}ml × ${quantity}`,
      actions: [
        { label: "عرض السلة", href: "/cart" },
        { label: "إتمام الطلب", href: "/checkout" }
      ]
    });
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3.5 rounded-[20px] border border-[#EFE7D6] bg-[#FBF8F2] px-4 py-3">
        <div>
          <p className="text-[11.5px] font-bold tracking-wide text-rawey-gold">ابتداءً من</p>
          <p dir="ltr" className="mt-0.5 whitespace-nowrap text-[27px] font-extrabold text-rawey-text">
            {formatPrice(total)}
          </p>
        </div>
        <QuantitySelector value={quantity} onChange={setQuantity} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">اختر الحجم</h2>
        <SizeSelector variants={variants} selectedVariantId={selectedVariant.id} onChange={setSelectedVariant} />
      </div>

      <Button
        onClick={handleAdd}
        className="h-14 w-full font-bold shadow-[0_14px_30px_rgba(26,26,26,0.22)]"
        size="lg"
      >
        <ShoppingBag className="h-5 w-5" />
        {added ? "تمت الإضافة" : "أضف إلى السلة"}
      </Button>
    </div>
  );
}
