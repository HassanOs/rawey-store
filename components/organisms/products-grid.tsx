"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ProductCard } from "@/components/molecules/product-card";
import { loadProductsPage } from "@/app/(store)/products/actions";
import type { ProductWithVariants } from "@/types/database";

type ProductsGridProps = {
  initialProducts: ProductWithVariants[];
  initialHasMore: boolean;
  search?: string;
  brandSlug?: string;
};

export function ProductsGrid({ initialProducts, initialHasMore, search, brandSlug }: ProductsGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const visibleProducts = products.filter((product) => product.variants.length);

  function loadMore() {
    startTransition(async () => {
      const nextPage = page + 1;
      const result = await loadProductsPage({ page: nextPage, search, brandSlug });
      setProducts((current) => [...current, ...result.products]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    });
  }

  if (!visibleProducts.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-rawey-line bg-white p-10 text-center">
        <h2 className="text-lg font-semibold">لا توجد منتجات مطابقة</h2>
        <p className="mt-2 text-sm text-rawey-muted">جرّب كلمة بحث مختلفة أو أزل الفلاتر.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasMore ? (
        <div className="flex justify-center">
          <Button type="button" onClick={loadMore} disabled={isPending} variant="secondary" className="min-w-40">
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {isPending ? "جاري التحميل..." : "تحميل المزيد"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
