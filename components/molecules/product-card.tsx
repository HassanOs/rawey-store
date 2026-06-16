"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { ProductQuickView } from "@/components/organisms/product-quick-view";
import { productPath } from "@/lib/products/slug";
import { formatPrice } from "@/lib/utils";
import type { ProductWithVariants } from "@/types/database";

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const [showQuickView, setShowQuickView] = useState(false);

  if (!product.variants.length) return null;

  const href = productPath(product);
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));

  return (
    <>
      <article className="group overflow-hidden rounded-[28px] border border-[#EDE8DF] bg-white shadow-[0_8px_30px_rgba(26,26,26,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(26,26,26,0.12)]">
        <Link href={href} className="block">
          <div className="relative aspect-square overflow-hidden bg-[#F7F4EF] sm:aspect-[4/5]">
            <div className="absolute inset-4">
              <Image
                src={product.image_url}
                alt={`${product.brand} ${product.name}`}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
                className="object-contain transition duration-500 group-hover:scale-[1.04]"
              />
            </div>
          </div>
        </Link>

        <div className="space-y-3 p-4">
          <div>
            <Badge className="gap-1.5">
              <span aria-hidden="true" className="inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-rawey-gold" />
              {product.brand}
            </Badge>
            <h2 className="mt-2.5 line-clamp-1 text-base font-bold text-rawey-text">{product.name}</h2>
            <p className="mt-1 text-sm font-semibold text-rawey-muted">
              ابتداءً من {formatPrice(lowestPrice)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowQuickView(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-rawey-line bg-white py-2.5 text-sm font-semibold text-rawey-text transition hover:border-rawey-gold hover:text-rawey-gold"
          >
            <Eye className="h-4 w-4" />
            معاينة سريعة
          </button>
        </div>
      </article>

      {showQuickView && (
        <ProductQuickView product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
}
