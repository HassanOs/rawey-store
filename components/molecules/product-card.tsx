import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { productPath } from "@/lib/products/slug";
import { formatPrice } from "@/lib/utils";
import type { ProductWithVariants } from "@/types/database";

type ProductCardProps = {
  product: ProductWithVariants;
};

export function ProductCard({ product }: ProductCardProps) {
  if (!product.variants.length) {
    return null;
  }

  const lowestPrice = Math.min(...product.variants.map((variant) => variant.price));
  const href = productPath(product);

  return (
    <article className="group overflow-hidden rounded-2xl border border-rawey-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft sm:rounded-[2rem]">
      <Link href={href} className="block">
        <div className="relative aspect-square bg-rawey-background/50 sm:aspect-[4/5]">
          <div className="absolute inset-3 sm:inset-4">
            <Image
              src={product.image_url}
              alt={`${product.brand} ${product.name}`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
              className="object-contain transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>
      </Link>
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-5">
        <div>
          <Badge>{product.brand}</Badge>
          <h2 className="mt-2 line-clamp-1 text-sm font-semibold text-rawey-text sm:mt-3 sm:text-lg">{product.name}</h2>
          <p className="mt-1 text-sm text-rawey-muted">ابتداءً من {formatPrice(lowestPrice)}</p>
        </div>
        <Button asChild href={href} variant="secondary" size="sm" className="w-full text-xs sm:h-11 sm:text-sm">
          عرض التفاصيل
        </Button>
      </div>
    </article>
  );
}
