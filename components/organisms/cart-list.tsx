"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import { QuantitySelector } from "@/components/molecules/quantity-selector";
import { formatPrice } from "@/lib/utils";
import { getCartSubtotal, useCartStore } from "@/store/cart-store";

export function CartList({ shippingPrice }: { shippingPrice: number }) {
  const { items, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const subtotal = getCartSubtotal(items);
  const total = subtotal + shippingPrice;

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-[2rem] border border-rawey-line bg-white shadow-sm" />;
  }

  if (!items.length) {
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
        {items.map((item) => (
          <article key={item.variantId} className="flex gap-4 rounded-[2rem] border border-rawey-line bg-white p-4 shadow-sm">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-rawey-background">
              <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/product/${item.productId}`} className="font-semibold hover:text-rawey-gold">
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-rawey-muted">
                {item.brand} - {item.sizeMl}ml
              </p>
              <p className="mt-2 text-sm font-semibold">{formatPrice(item.price)}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <QuantitySelector value={item.quantity} onChange={(value) => updateQuantity(item.variantId, value)} />
                <Button variant="ghost" size="icon" aria-label="حذف المنتج" onClick={() => removeItem(item.variantId)}>
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
