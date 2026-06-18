import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { BrandFilter } from "@/components/molecules/brand-filter";
import { SearchBar } from "@/components/molecules/search-bar";
import { ProductsGrid } from "@/components/organisms/products-grid";
import { getBrands, getProductsPage, PRODUCTS_PAGE_SIZE } from "@/lib/data/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "عيّنات عطور أصلية في لبنان",
  description: "تسوق عيّنات عطور أصلية في لبنان من Rawey بأحجام 3ml و5ml و10ml مع توصيل لجميع المناطق اللبنانية.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Rawey | عيّنات عطور أصلية في لبنان",
    description: "تسوق عيّنات عطور أصلية في لبنان بأحجام صغيرة وتجربة سهلة قبل شراء العطر الكامل.",
    url: "/",
    type: "website"
  }
};

type HomePageProps = {
  searchParams: Promise<{
    search?: string;
    brand?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const [productPage, brands] = await Promise.all([
    getProductsPage({ search: params.search, brandSlug: params.brand }, 0, PRODUCTS_PAGE_SIZE),
    getBrands()
  ]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_480px] lg:px-8 lg:py-16">
        <div>
          <Badge className="mb-5 gap-1.5">
            <span aria-hidden="true" className="inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-rawey-gold" />
            عيّنات عطور أصلية
          </Badge>
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-rawey-text sm:text-5xl lg:text-6xl">
           عطرك المفضّل,{" "}
            <span className="text-rawey-gold">بالحجم المناسب</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-rawey-muted sm:text-lg">
           اختر العينة التي تناسب ذوقك بأحجام 3ml و 5ml و 10ml، مع توصيل لجميع المناطق اللبنانية.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#catalog" asChild size="lg">
              تسوق الآن
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button asChild href="/cart" size="lg" variant="secondary">
              السلة
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-rawey-line bg-white shadow-soft">
          <Image
            src="/images/rawey-hero.webp"
            alt="عيّنات عطور Rawey الأصلية في لبنان"
            fill
            priority
            sizes="(min-width: 1024px) 480px, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* ── Catalog ── */}
      <section id="catalog" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-3 rounded-[2rem] border border-rawey-line bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
          <SearchBar basePath="/" />
          <BrandFilter brands={brands} basePath="/" />
        </div>
        <ProductsGrid
          key={`${params.search ?? ""}-${params.brand ?? ""}`}
          initialProducts={productPage.products}
          initialHasMore={productPage.hasMore}
          search={params.search}
          brandSlug={params.brand}
        />
      </section>
    </>
  );
}
