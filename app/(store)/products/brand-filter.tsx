"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/atoms/select";
import { brandPath } from "@/lib/products/slug";
import type { BrandLink } from "@/lib/data/products";

export function BrandFilter({ activeBrandSlug, brands }: { activeBrandSlug?: string; brands: BrandLink[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function updateBrand(value: string) {
    const next = new URLSearchParams(params.toString());
    const query = next.toString();

    if (!value) {
      router.push(`/products${query ? `?${query}` : ""}`);
      return;
    }

    const brand = brands.find((item) => item.slug === value);
    if (!brand) return;

    router.push(`${brandPath({ brand: brand.name, brand_slug: brand.slug })}${query ? `?${query}` : ""}`);
  }

  return (
    <Select defaultValue={activeBrandSlug || ""} onChange={(event) => updateBrand(event.target.value)}>
      <option value="">كل العلامات</option>
      {brands.map((brand) => (
        <option key={brand.slug} value={brand.slug}>
          {brand.name}
        </option>
      ))}
    </Select>
  );
}
