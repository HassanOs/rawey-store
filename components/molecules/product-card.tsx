import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { formatPrice } from "@/lib/utils";
import type { ProductWithVariants } from "@/types/database";

type ProductCardProps = {
  product: ProductWithVariants;
};

export function ProductCard({ product }: ProductCardProps) {
  const lowestPrice = Math.min(...product.variants.map((variant) => variant.price));

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-rawey-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] bg-white">
          <Image
            src={product.image_url}
            alt={`${product.brand} ${product.name}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div>
          <Badge>{product.brand}</Badge>
          <h2 className="mt-3 line-clamp-1 text-lg font-semibold text-rawey-text">{product.name}</h2>
          <p className="mt-1 text-sm text-rawey-muted">ابتداءً من {formatPrice(lowestPrice)}</p>
        </div>
        <Button asChild href={`/product/${product.id}`} variant="secondary" className="w-full">
          عرض التفاصيل
        </Button>
      </div>
    </article>
  );
}
