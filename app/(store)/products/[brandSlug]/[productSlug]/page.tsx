import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/atoms/badge";
import { ProductDescription } from "@/components/organisms/product-description";
import { ProductPurchase } from "@/components/organisms/product-purchase";
import { getProductBySlugs } from "@/lib/data/products";
import { brandPath, productPath } from "@/lib/products/slug";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { stringifyJsonLd } from "@/lib/seo/json-ld";

type ProductPageProps = {
  params: Promise<{
    brandSlug: string;
    productSlug: string;
  }>;
};

export const revalidate = 300;

function productTitle(product: { brand: string; name: string }) {
  return `${product.brand} ${product.name}`;
}

function productSeoDescription(product: { brand: string; description: string; name: string }) {
  return `${productTitle(product)} من Rawey في لبنان. ${product.description} متوفر كعيّنة عطر أصلية بأحجام 3ml و5ml و10ml مع توصيل داخل لبنان.`;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { brandSlug, productSlug } = await params;
  const product = await getProductBySlugs(brandSlug, productSlug);

  if (!product) {
    return { title: "منتج غير موجود" };
  }

  const title = productTitle(product);
  const description = productSeoDescription(product);
  const url = absoluteUrl(productPath(product));

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: product.image_url, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image_url]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { brandSlug, productSlug } = await params;
  const product = await getProductBySlugs(brandSlug, productSlug);

  if (!product || !product.variants.length) {
    notFound();
  }

  const canonicalPath = productPath(product);
  const brandUrl = absoluteUrl(brandPath(product));
  const title = productTitle(product);
  const productUrl = absoluteUrl(canonicalPath);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    brand: {
      "@type": "Brand",
      name: product.brand
    },
    description: product.description,
    image: [product.image_url],
    url: productUrl,
    areaServed: {
      "@type": "Country",
      name: siteConfig.location.countryName,
      alternateName: siteConfig.location.countryNameAr
    },
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      price: variant.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url: productUrl,
      name: `${title} ${variant.size_ml}ml`,
      areaServed: {
        "@type": "Country",
        name: siteConfig.location.countryName,
        alternateName: siteConfig.location.countryNameAr
      },
      seller: {
        "@type": "Store",
        name: siteConfig.name,
        areaServed: {
          "@type": "Country",
          name: siteConfig.location.countryName
        }
      }
    }))
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteConfig.name,
        item: absoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "المنتجات",
        item: absoluteUrl("/products")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.brand,
        item: brandUrl
      },
      {
        "@type": "ListItem",
        position: 4,
        name: title,
        item: productUrl
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
      />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-10">
        <div className="relative order-2 aspect-[4/5] overflow-hidden rounded-[2rem] border border-rawey-line bg-rawey-background/50 shadow-soft lg:order-1">
          <div className="absolute inset-5 sm:inset-8">
            <Image
              src={product.image_url}
              alt={title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain"
            />
          </div>
        </div>
        <div className="order-1 self-center rounded-[2rem] border border-rawey-line bg-white p-5 shadow-sm sm:p-6 lg:order-2 lg:p-8">
          <Badge>{product.brand}</Badge>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-sm font-semibold text-rawey-muted">متوفر للتوصيل داخل لبنان</p>
          <div className="mt-5">
            <ProductPurchase product={product} />
          </div>
          <div className="mt-6">
            <ProductDescription description={product.description} />
          </div>
        </div>
      </section>
    </>
  );
}
