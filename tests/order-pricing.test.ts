import { describe, expect, it } from "vitest";
import { MAX_ITEM_QUANTITY, parseCartPayload, priceCartItems } from "@/lib/orders/pricing";

const productId = "11111111-1111-4111-8111-111111111111";
const variantId = "22222222-2222-4222-8222-222222222222";

const product = {
  id: productId,
  name: "Rawey Sample",
  brand: "Rawey",
  brand_slug: "rawey",
  slug: "rawey-sample",
  image_url: "https://example.com/product.jpg"
};

describe("order pricing", () => {
  it("uses canonical database prices instead of client supplied prices", () => {
    const parsed = parseCartPayload([
      {
        productId,
        variantId,
        quantity: 2,
        price: 0,
        name: "Tampered"
      }
    ]);

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const priced = priceCartItems(parsed.items, [
      {
        id: variantId,
        product_id: productId,
        size_ml: 5,
        price: "12.5",
        product
      }
    ]);

    expect(priced.ok).toBe(true);
    if (!priced.ok) return;
    expect(priced.items[0].price).toBe(12.5);
    expect(priced.items[0].name).toBe(product.name);
    expect(priced.items[0].brandSlug).toBe(product.brand_slug);
    expect(priced.subtotal).toBe(25);
  });

  it("rejects mismatched product and variant ids", () => {
    const parsed = parseCartPayload([{ productId, variantId, quantity: 1 }]);

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const priced = priceCartItems(parsed.items, [
      {
        id: variantId,
        product_id: "33333333-3333-4333-8333-333333333333",
        size_ml: 5,
        price: 12.5,
        product
      }
    ]);

    expect(priced.ok).toBe(false);
  });

  it("rejects quantities above the per-item limit", () => {
    const parsed = parseCartPayload([{ productId, variantId, quantity: MAX_ITEM_QUANTITY + 1 }]);

    expect(parsed.ok).toBe(false);
  });
});
