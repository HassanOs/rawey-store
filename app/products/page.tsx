import type { Metadata } from "next";
import { SearchBar } from "@/components/molecules/search-bar";
import { ProductsGrid } from "@/components/organisms/products-grid";
import { getBrands, getProducts } from "@/lib/data/products";
import { BrandFilter } from "./brand-filter";

export const metadata: Metadata = {
  title: "المنتجات",
  description: "تسوق عيّنات العطور الأصلية من Rawey."
};

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    brand?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [products, brands] = await Promise.all([
    getProducts({ search: params.search, brand: params.brand }),
    getBrands()
  ]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">المنتجات</h1>
        <p className="mt-2 text-rawey-muted">اختر الحجم المناسب وادفع عند الاستلام أو عبر Wish Money.</p>
      </div>
      <div className="mb-8 grid gap-3 rounded-[2rem] border border-rawey-line bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
        <SearchBar />
        <BrandFilter brands={brands} />
      </div>
      <ProductsGrid products={products} />
    </section>
  );
}
