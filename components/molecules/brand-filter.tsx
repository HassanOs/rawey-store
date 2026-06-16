"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/atoms/select";
import type { BrandLink } from "@/lib/data/products";

type BrandFilterProps = {
  brands: BrandLink[];
  basePath?: string;
};

export function BrandFilter({ brands, basePath = "/" }: BrandFilterProps) {
  const router = useRouter();
  const params = useSearchParams();
  const activeBrand = params.get("brand") || "";

  function updateBrand(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("brand", value);
    else next.delete("brand");
    const query = next.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
  }

  return (
    <Select defaultValue={activeBrand} onChange={(event) => updateBrand(event.target.value)}>
      <option value="">كل العلامات</option>
      {brands.map((brand) => (
        <option key={brand.slug} value={brand.slug}>
          {brand.name}
        </option>
      ))}
    </Select>
  );
}
