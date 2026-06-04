import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const storefrontRoots = [
  "app/(store)",
  "components/atoms",
  "components/molecules",
  "components/organisms/cart-list.tsx",
  "components/organisms/checkout-form.tsx",
  "components/organisms/footer.tsx",
  "components/organisms/navbar.tsx",
  "components/organisms/product-description.tsx",
  "components/organisms/product-purchase.tsx",
  "components/organisms/products-grid.tsx",
  "components/organisms/toast-provider.tsx"
];

function sourceFiles(pathname: string): string[] {
  const absolutePath = join(process.cwd(), pathname);

  if (!existsSync(absolutePath)) {
    return [];
  }

  if (statSync(absolutePath).isFile()) {
    return [absolutePath];
  }

  return readdirSync(absolutePath).flatMap((entry) => {
    const child = join(absolutePath, entry);
    if (statSync(child).isDirectory()) {
      return sourceFiles(relative(process.cwd(), child));
    }

    return /\.(ts|tsx)$/.test(entry) ? [child] : [];
  });
}

describe("public storefront boundaries", () => {
  it("does not expose admin navigation in customer-facing files", () => {
    const violations = storefrontRoots
      .flatMap(sourceFiles)
      .flatMap((file) => {
        const source = readFileSync(file, "utf8");
        const relativeFile = relative(process.cwd(), file);
        const failures: string[] = [];

        if (/href\s*=\s*["'{`]\/admin\b/.test(source)) {
          failures.push(`${relativeFile}: admin href`);
        }

        if (source.includes("الإدارة") || source.includes("لوحة الإدارة")) {
          failures.push(`${relativeFile}: admin label`);
        }

        return failures;
      });

    expect(violations).toEqual([]);
  });

  it("keeps the customer navbar independent from admin auth state", () => {
    const navbar = readFileSync(join(process.cwd(), "components/organisms/navbar.tsx"), "utf8");

    expect(navbar).not.toContain("createClient");
    expect(navbar).not.toContain("profiles");
    expect(navbar).not.toContain("isAdmin");
  });
});
