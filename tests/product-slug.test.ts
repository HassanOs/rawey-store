import { describe, expect, it } from "vitest";
import { brandPath, buildBrandSlugBase, buildProductSlugBase, productPath, slugifyProductName } from "@/lib/products/slug";

describe("product slugs", () => {
  it("normalizes product names into readable URL slugs", () => {
    expect(slugifyProductName("  Dior Homme Intense EDP  ")).toBe("dior-homme-intense-edp");
    expect(slugifyProductName("Blue de Chanel & Oud!")).toBe("blue-de-chanel-and-oud");
  });

  it("builds a stable product URL from the stored slug", () => {
    expect(productPath({
      id: "11111111-1111-4111-8111-111111111111",
      brand: "Dior",
      brand_slug: "dior",
      name: "Dior Homme Intense EDP",
      slug: "dior-homme-intense-edp"
    })).toBe("/products/dior/dior-homme-intense-edp");
  });

  it("builds readable fallback URLs when slugs are missing", () => {
    expect(productPath({
      id: "11111111-1111-4111-8111-111111111111",
      brand: "Dior",
      name: "Dior Homme Intense EDP"
    })).toBe("/products/dior/dior-homme-intense-edp");
  });

  it("builds brand URLs from stored or generated brand slugs", () => {
    expect(brandPath({ brand: "Dior", brand_slug: "dior" })).toBe("/products/dior");
    expect(buildBrandSlugBase("Blue de Chanel")).toBe("blue-de-chanel");
  });

  it("uses product as the last-resort slug base", () => {
    expect(buildProductSlugBase({ brand: "عطر", name: "عطر" })).toBe("product");
  });
});
