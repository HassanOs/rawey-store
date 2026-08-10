export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { getBrands, getProducts } from "@/lib/data/products";
import { brandPath, productPath } from "@/lib/products/slug";
import type { BrandLink } from "@/lib/data/products";
import type { ProductWithVariants } from "@/types/database";

export const revalidate = 3600;

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://rawey-store.vercel.app";
const safeBaseUrl = baseUrl.replace(/\/$/, "");

function sitemapUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${safeBaseUrl}${normalizedPath}`;
}

type SitemapData = {
  brands: BrandLink[];
  products: ProductWithVariants[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { brands, products } = await getSitemapData();
  const now = new Date();

  return [
    {
      url: sitemapUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: sitemapUrl("/products"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...brands.map((brand) => ({
      url: sitemapUrl(brandPath({ brand: brand.name, brand_slug: brand.slug })),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
    ...products.map((product) => ({
      url: sitemapUrl(productPath(product)),
      lastModified: product.created_at ? new Date(product.created_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

async function getSitemapData(): Promise<SitemapData> {
  try {
    const [products, brands] = await Promise.all([getProducts(), getBrands()]);
    return { brands, products };
  } catch (error) {
    if (isMissingSlugMigrationError(error)) {
      return { brands: [], products: [] };
    }

    throw error;
  }
}

function isMissingSlugMigrationError(error: unknown) {
  return error instanceof Error && /brand_slug|slug/i.test(error.message);
}
