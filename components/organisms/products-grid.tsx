import { ProductCard } from "@/components/molecules/product-card";
import type { ProductWithVariants } from "@/types/database";

type ProductsGridProps = {
  products: ProductWithVariants[];
};

export function ProductsGrid({ products }: ProductsGridProps) {
  const visibleProducts = products.filter((product) => product.variants.length);

  if (!visibleProducts.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-rawey-line bg-white p-10 text-center">
        <h2 className="text-lg font-semibold">لا توجد منتجات مطابقة</h2>
        <p className="mt-2 text-sm text-rawey-muted">جرّب كلمة بحث مختلفة أو أزل الفلاتر.</p>
      </div>
    );
  }

  return (
    <div className="grid max-h-[52rem] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:max-h-none sm:gap-5 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
      {visibleProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
