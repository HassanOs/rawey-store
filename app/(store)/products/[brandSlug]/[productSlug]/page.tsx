import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductViewContentPixel } from "@/components/analytics/meta-pixel";
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

function productSeoDescription(product: {
  brand: string;
  description: string;
  name: string;
}) {
  return `${productTitle(product)} من Rawey في لبنان. ${product.description} متوفر كعيّنة عطر أصلية بأحجام 3ml و5ml و10ml مع توصيل داخل لبنان.`;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
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
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: product.image_url, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image_url],
    },
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
      name: product.brand,
    },
    description: product.description,
    image: [product.image_url],
    url: productUrl,
    areaServed: {
      "@type": "Country",
      name: siteConfig.location.countryName,
      alternateName: siteConfig.location.countryNameAr,
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
        alternateName: siteConfig.location.countryNameAr,
      },
      seller: {
        "@type": "Store",
        name: siteConfig.name,
        areaServed: {
          "@type": "Country",
          name: siteConfig.location.countryName,
        },
      },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteConfig.name,
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "المنتجات",
        item: absoluteUrl("/products"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.brand,
        item: brandUrl,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: title,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <ProductViewContentPixel
        productId={product.id}
        productName={title}
        productBrand={product.brand}
        price={product.variants[0]?.price ?? 0}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
      />
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="relative rounded-[28px] border border-[#EDE8DF] bg-white p-4 shadow-[0_22px_60px_rgba(26,26,26,0.10)] sm:p-[26px]">
          <div className="flex flex-col gap-[18px] sm:grid sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] sm:items-stretch sm:gap-[34px]">
            {/* Image — RTL first child = right column on sm+ */}
            <div className="relative h-[264px] overflow-hidden rounded-[22px] border border-[#EFEAE1] bg-[#F7F4EF] sm:h-auto sm:min-h-[480px]">
              <div className="absolute inset-5">
                <Image
                  src={product.image_url}
                  alt={title}
                  fill
                  priority
                  sizes="(min-width: 640px) 42vw, 100vw"
                  className="object-contain"
                />
              </div>
            </div>

            {/* Info — RTL second child = left column on sm+ */}
            <div className="sm:self-center">
              <Badge className="gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-rawey-gold"
                />
                {product.brand}
              </Badge>
              <h1 className="mt-3 text-[28px] font-extrabold leading-snug">
                {product.name}
              </h1>
              <div className="mt-2.5 h-[3px] w-[42px] rounded bg-rawey-gold" />
              <p className="mt-2.5 text-[13.5px] font-semibold text-rawey-muted">
                متوفر للتوصيل داخل لبنان
              </p>
              <div className="mt-5">
                <ProductPurchase product={product} />
              </div>
              <div className="mt-[22px]">
                <ProductDescription description={product.description} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
