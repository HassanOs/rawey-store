import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/atoms/badge";
import { ProductDescription } from "@/components/organisms/product-description";
import { ProductPurchase } from "@/components/organisms/product-purchase";
import { getProduct } from "@/lib/data/products";
import { getBaseUrl } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "منتج غير موجود" };
  }

  return {
    title: `${product.brand} ${product.name}`,
    description: product.description,
    alternates: {
      canonical: `${getBaseUrl()}/product/${product.id}`
    },
    openGraph: {
      title: `${product.brand} ${product.name}`,
      description: product.description,
      images: [{ url: product.image_url }]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product || !product.variants.length) {
    notFound();
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-10">
      <div className="relative order-2 aspect-[4/5] overflow-hidden rounded-[2rem] border border-rawey-line bg-white shadow-soft lg:order-1">
        <Image
          src={product.image_url}
          alt={`${product.brand} ${product.name}`}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="order-1 self-center rounded-[2rem] border border-rawey-line bg-white p-5 shadow-sm sm:p-6 lg:order-2 lg:p-8">
        <Badge>{product.brand}</Badge>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">{product.name}</h1>
        <div className="mt-5">
          <ProductPurchase product={product} />
        </div>
        <div className="mt-6">
          <ProductDescription description={product.description} />
        </div>
      </div>
    </section>
  );
}
