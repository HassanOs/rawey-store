"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { AdminProductForm } from "@/components/organisms/admin-product-form";
import { EmptyState } from "@/components/organisms/admin-dashboard-ui";
import { deleteProduct, deleteProducts, updateProduct } from "@/app/admin/actions";
import type { ProductWithVariants } from "@/types/database";

export function InventoryTable({ products }: { products: ProductWithVariants[] }) {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const visibleProductIds = useMemo(() => products.map((product) => product.id), [products]);
  const allVisibleSelected = visibleProductIds.length > 0 && visibleProductIds.every((id) => selectedProductIds.includes(id));

  if (!products.length) {
    return <EmptyState>لا توجد منتجات مطابقة.</EmptyState>;
  }

  function toggleProduct(productId: string) {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  }

  function toggleVisibleProducts() {
    setSelectedProductIds((current) => {
      if (visibleProductIds.every((id) => current.includes(id))) {
        return current.filter((id) => !visibleProductIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleProductIds]));
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rawey-line bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-rawey-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold">{products.length} منتج في هذه الصفحة</p>
        <form action={deleteProducts} className="flex flex-wrap items-center gap-2">
          {selectedProductIds.map((id) => <input key={id} type="hidden" name="product_id" value={id} />)}
          <Button type="submit" variant="danger" size="sm" disabled={!selectedProductIds.length}>
            حذف المحدد
          </Button>
        </form>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-[36px_minmax(180px,1fr)_150px_140px_40px] gap-3 border-b border-rawey-line px-4 py-3 text-xs font-bold text-rawey-muted">
          <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleProducts} aria-label="تحديد كل المنتجات الظاهرة" />
          <span>المنتج</span>
          <span>العلامة</span>
          <span>الأحجام</span>
          <span />
        </div>
        <div className="divide-y divide-rawey-line">
          {products.map((product) => (
            <details key={product.id} className="group">
              <summary className="grid min-w-[640px] cursor-pointer grid-cols-[36px_minmax(180px,1fr)_150px_140px_40px] items-center gap-3 px-4 py-3 text-sm transition hover:bg-rawey-background">
                <input
                  type="checkbox"
                  checked={selectedProductIds.includes(product.id)}
                  onChange={() => toggleProduct(product.id)}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`تحديد ${product.name}`}
                />
                <span className="truncate font-semibold">{product.name}</span>
                <span className="truncate text-rawey-muted">{product.brand}</span>
                <span className="text-xs font-semibold text-rawey-muted">{product.variants.length} أحجام</span>
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>
              <div className="space-y-3 bg-rawey-background/70 p-4">
                <AdminProductForm product={product} action={updateProduct.bind(null, product.id)} />
                <form action={deleteProduct.bind(null, product.id)} className="flex justify-end">
                  <Button type="submit" variant="danger" size="sm">حذف المنتج</Button>
                </form>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
