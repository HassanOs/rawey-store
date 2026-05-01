import { ProductCard } from "@/components/molecules/product-card";
import type { ProductWithVariants } from "@/types/database";

type ProductsGridProps = {
  products: ProductWithVariants[];
};

export function ProductsGrid({ products }: ProductsGridProps) {
  if (!products.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-rawey-line bg-white p-10 text-center">
        <h2 className="text-lg font-semibold">لا توجد منتجات مطابقة</h2>
        <p className="mt-2 text-sm text-rawey-muted">جرّب كلمة بحث مختلفة أو أزل الفلاتر.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
