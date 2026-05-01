"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/atoms/select";

export function BrandFilter({ brands }: { brands: string[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function updateBrand(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("brand", value);
    else next.delete("brand");
    router.push(`/products?${next.toString()}`);
  }

  return (
    <Select defaultValue={params.get("brand") || ""} onChange={(event) => updateBrand(event.target.value)}>
      <option value="">كل العلامات</option>
      {brands.map((brand) => (
        <option key={brand} value={brand}>
          {brand}
        </option>
      ))}
    </Select>
  );
}
