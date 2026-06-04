import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/lib/site";

function source(pathname: string) {
  return readFileSync(join(process.cwd(), pathname), "utf8");
}

describe("Lebanon SEO signals", () => {
  it("targets the Lebanon market in global site metadata", () => {
    expect(siteConfig.description).toContain("لبنان");
    expect(siteConfig.location.countryCode).toBe("LB");
    expect(siteConfig.keywords.join(" ")).toContain("Lebanon");
  });

  it("keeps Lebanon copy on indexable storefront pages", () => {
    expect(source("app/(store)/page.tsx")).toContain("لبنان");
    expect(source("app/(store)/products/page.tsx")).toContain("لبنان");
    expect(source("app/(store)/products/[brandSlug]/page.tsx")).toContain("لبنان");
  });

  it("marks product structured data as served in Lebanon", () => {
    const productPage = source("app/(store)/products/[brandSlug]/[productSlug]/page.tsx");

    expect(productPage).toContain("areaServed");
    expect(productPage).toContain("countryName");
  });

  it("uses the configured public site URL for canonical and sitemap URLs", () => {
    expect(source(".env.example")).toContain("NEXT_PUBLIC_SITE_URL");
    expect(source("app/sitemap.ts")).toContain("absoluteUrl");
    expect(source("app/robots.ts")).toContain("getSiteUrl");
  });
});
