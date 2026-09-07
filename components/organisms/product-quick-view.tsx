"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { ProductViewContentPixel } from "@/components/analytics/meta-pixel";
import { Badge } from "@/components/atoms/badge";
import { ProductDescription } from "@/components/organisms/product-description";
import { ProductPurchase } from "@/components/organisms/product-purchase";
import { productPath } from "@/lib/products/slug";
import type { ProductWithVariants } from "@/types/database";

type ProductQuickViewProps = {
  product: ProductWithVariants;
  onClose: () => void;
};

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const href = productPath(product);
  const title = `${product.brand} ${product.name}`;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <ProductViewContentPixel
        productId={product.id}
        productName={title}
        productBrand={product.brand}
        price={product.variants[0]?.price ?? 0}
      />
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-rawey-text/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[#EDE8DF] bg-white p-4 shadow-[0_22px_60px_rgba(26,26,26,0.20)] sm:p-[26px]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute end-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-rawey-line bg-white text-rawey-muted shadow-sm transition hover:text-rawey-text"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-[18px] sm:grid sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] sm:items-stretch sm:gap-[34px]">
          {/* Image — RTL: first child = right column */}
          <Link href={href} onClick={onClose} className="block">
            <div className="relative h-[240px] overflow-hidden rounded-[22px] border border-[#EFEAE1] bg-[#F7F4EF] transition-opacity hover:opacity-90 sm:h-auto sm:min-h-[380px]">
              <div className="absolute inset-5">
                <Image
                  src={product.image_url}
                  alt={title}
                  fill
                  sizes="(min-width: 640px) 40vw, 100vw"
                  className="object-contain"
                />
              </div>
            </div>
          </Link>

          {/* Info */}
          <div className="sm:self-center">
            <Badge className="gap-1.5">
              <span aria-hidden="true" className="inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-rawey-gold" />
              {product.brand}
            </Badge>
            <h2 className="mt-3 text-[26px] font-extrabold leading-snug">{product.name}</h2>
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
            <Link
              href={href}
              onClick={onClose}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rawey-muted transition hover:text-rawey-text"
            >
              عرض الصفحة الكاملة
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
