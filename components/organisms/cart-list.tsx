"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import { QuantitySelector } from "@/components/molecules/quantity-selector";
import { useToast } from "@/components/organisms/toast-provider";
import { getProductSizeLabel, isAllowedProductSize } from "@/lib/product-variants";
import { productPath } from "@/lib/products/slug";
import { formatPrice } from "@/lib/utils";
import { getCartSubtotal, useCartStore } from "@/store/cart-store";
import type { CartItem } from "@/types/cart";

export function CartList({ shippingPrice }: { shippingPrice: number }) {
  const { items, addItem, removeItem, updateQuantity } = useCartStore();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const visibleItems = items.filter((item) => isAllowedProductSize(item.sizeMl));
  const subtotal = getCartSubtotal(visibleItems);
  const total = subtotal + shippingPrice;

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);

    return () => window.clearTimeout(timer);
  }, []);

  function handleRemove(item: CartItem) {
    removeItem(item.variantId);
    showToast({
      title: "تم حذف المنتج من السلة",
      description: `${item.brand} ${item.name}`,
      actions: [
        {
          label: "تراجع",
          onClick: () => addItem(item)
        },
        { label: "متابعة التسوق", href: "/products" }
      ]
    });
  }

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-[2rem] border border-rawey-line bg-white shadow-sm" />;
  }

  if (!visibleItems.length) {
    return (
      <div className="rounded-[2rem] border border-rawey-line bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">السلة فارغة</h1>
        <p className="mt-2 text-rawey-muted">أضف بعض العيّنات لتكمل الطلب.</p>
        <Button asChild href="/products" className="mt-8">
          تصفح المنتجات
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {visibleItems.map((item) => (
          <article key={item.variantId} className="flex gap-4 rounded-[2rem] border border-rawey-line bg-white p-4 shadow-sm">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-rawey-background">
              <div className="absolute inset-2">
                <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-contain" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={productPath({
                  id: item.productId,
                  name: item.name,
                  brand: item.brand,
                  brand_slug: item.brandSlug,
                  slug: item.slug
                })}
                className="font-semibold hover:text-rawey-gold"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-rawey-muted">
                {item.brand} - {getProductSizeLabel(item.sizeMl)}
              </p>
              <p className="mt-2 text-sm font-semibold">{formatPrice(item.price)}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <QuantitySelector value={item.quantity} onChange={(value) => updateQuantity(item.variantId, value)} />
                <Button variant="ghost" size="icon" aria-label="حذف المنتج" onClick={() => handleRemove(item)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <aside className="h-fit rounded-[2rem] border border-rawey-line bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">ملخص الطلب</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-rawey-muted">المجموع</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rawey-muted">التوصيل</span>
            <span>{formatPrice(shippingPrice)}</span>
          </div>
          <div className="flex justify-between border-t border-rawey-line pt-4 text-base font-semibold">
            <span>الإجمالي</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        <Button asChild href="/checkout" className="mt-6 w-full">
          متابعة الدفع
        </Button>
      </aside>
    </div>
  );
}
