import type { Metadata } from "next";
import { SearchBar } from "@/components/molecules/search-bar";
import { ProductsGrid } from "@/components/organisms/products-grid";
import { getBrands, getProductsPage, PRODUCTS_PAGE_SIZE } from "@/lib/data/products";
import { BrandFilter } from "./brand-filter";

export const revalidate = 300;

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = Boolean(params.search);

  return {
    title: "المنتجات",
    description: "تسوق عيّنات العطور الأصلية من Rawey.",
    alternates: {
      canonical: "/products"
    },
    robots: hasFilters
      ? {
          index: false,
          follow: true
        }
      : {
          index: true,
          follow: true
        },
    openGraph: {
      title: "منتجات Rawey",
      description: "تسوق عيّنات العطور الأصلية من Rawey.",
      url: "/products",
      type: "website"
    }
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [productPage, brands] = await Promise.all([
    getProductsPage({ search: params.search }, 0, PRODUCTS_PAGE_SIZE),
    getBrands()
  ]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">المنتجات</h1>
        <p className="mt-2 text-rawey-muted">اختر الحجم المناسب وادفع عند الاستلام أو عبر Wish Money.</p>
      </div>
      <div className="mb-8 grid gap-3 rounded-[2rem] border border-rawey-line bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
        <SearchBar />
        <BrandFilter brands={brands} />
      </div>
      <ProductsGrid
        key={params.search ?? ""}
        initialProducts={productPage.products}
        initialHasMore={productPage.hasMore}
        search={params.search}
      />
    </section>
  );
}
