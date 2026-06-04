import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchBar } from "@/components/molecules/search-bar";
import { ProductsGrid } from "@/components/organisms/products-grid";
import { getBrandBySlug, getBrands, getProductsPage, PRODUCTS_PAGE_SIZE } from "@/lib/data/products";
import { brandPath } from "@/lib/products/slug";
import { absoluteUrl } from "@/lib/site";
import { BrandFilter } from "../brand-filter";

export const revalidate = 300;

type BrandProductsPageProps = {
  params: Promise<{
    brandSlug: string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
};

export async function generateMetadata({ params, searchParams }: BrandProductsPageProps): Promise<Metadata> {
  const [{ brandSlug }, query] = await Promise.all([params, searchParams]);
  const brand = await getBrandBySlug(brandSlug);

  if (!brand) {
    return { title: "علامة غير موجودة" };
  }

  const canonical = absoluteUrl(brandPath({ brand: brand.name, brand_slug: brand.slug }));
  const title = `عيّنات عطور ${brand.name} في لبنان`;
  const description = `تسوق عيّنات عطور ${brand.name} الأصلية في لبنان من Rawey بأحجام 3ml و5ml و10ml مع توصيل داخل لبنان.`;

  return {
    title,
    description,
    alternates: {
      canonical
    },
    robots: query.search
      ? {
          index: false,
          follow: true
        }
      : {
          index: true,
          follow: true
        },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website"
    }
  };
}

export default async function BrandProductsPage({ params, searchParams }: BrandProductsPageProps) {
  const [{ brandSlug }, query] = await Promise.all([params, searchParams]);
  const brand = await getBrandBySlug(brandSlug);

  if (!brand) {
    notFound();
  }

  const [productPage, brands] = await Promise.all([
    getProductsPage({ search: query.search, brandSlug: brand.slug }, 0, PRODUCTS_PAGE_SIZE),
    getBrands()
  ]);
  const basePath = brandPath({ brand: brand.name, brand_slug: brand.slug });

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">عيّنات {brand.name} في لبنان</h1>
        <p className="mt-2 text-rawey-muted">تصفح عيّنات {brand.name} المتوفرة في لبنان واختَر الحجم المناسب للتوصيل داخل لبنان.</p>
      </div>
      <div className="mb-8 grid gap-3 rounded-[2rem] border border-rawey-line bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
        <SearchBar basePath={basePath} />
        <BrandFilter brands={brands} activeBrandSlug={brand.slug} />
      </div>
      <ProductsGrid
        key={`${query.search ?? ""}:${brand.slug}`}
        initialProducts={productPage.products}
        initialHasMore={productPage.hasMore}
        search={query.search}
        brandSlug={brand.slug}
      />
    </section>
  );
}
