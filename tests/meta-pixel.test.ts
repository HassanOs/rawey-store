import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildPurchasePayload,
  cartPixelPayload,
  countPixelItems,
  PIXEL_CURRENCY,
  sumPixelValue,
  toPixelContents,
  trackMetaPixel,
  trackMetaPixelOnce
} from "@/lib/analytics/pixel";

function source(pathname: string) {
  return readFileSync(join(process.cwd(), pathname), "utf8");
}

const cart = [
  { productId: "prod-a", price: 12.5, quantity: 2 },
  { productId: "prod-b", price: 8.1, quantity: 1 }
];

describe("Meta Pixel payloads", () => {
  it("maps cart lines to Meta contents entries", () => {
    expect(toPixelContents(cart)).toEqual([
      { id: "prod-a", quantity: 2, item_price: 12.5 },
      { id: "prod-b", quantity: 1, item_price: 8.1 }
    ]);
  });

  it("sums line totals and rounds away float noise", () => {
    expect(sumPixelValue(cart)).toBe(33.1);
    expect(sumPixelValue([{ productId: "x", price: 0.1, quantity: 3 }])).toBe(0.3);
    expect(sumPixelValue([])).toBe(0);
  });

  it("counts units rather than cart lines", () => {
    expect(countPixelItems(cart)).toBe(3);
  });

  it("builds one shared shape for the funnel events", () => {
    expect(cartPixelPayload(cart)).toEqual({
      content_type: "product",
      content_ids: ["prod-a", "prod-b"],
      contents: toPixelContents(cart),
      num_items: 3,
      value: 33.1,
      currency: PIXEL_CURRENCY
    });
  });

  it("tracks the server order total, including shipping, not the item subtotal", () => {
    const payload = buildPurchasePayload("order-1", cart, 36.6);

    expect(payload.value).toBe(36.6);
    expect(payload.value).not.toBe(sumPixelValue(cart));
    expect(payload.orderId).toBe("order-1");
    expect(payload.numItems).toBe(3);
    expect(payload.contentIds).toEqual(["prod-a", "prod-b"]);
    expect(payload.currency).toBe(PIXEL_CURRENCY);
  });
});

type FakeWindow = {
  fbq: ReturnType<typeof vi.fn>;
  sessionStorage: Storage;
};

function withFakeBrowser() {
  const store = new Map<string, string>();
  const fake: FakeWindow = {
    fbq: vi.fn(),
    sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
      key: () => null,
      length: 0
    } as unknown as Storage
  };

  vi.stubGlobal("window", fake);

  return fake;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Meta Pixel dispatch", () => {
  it("passes an eventID so Meta can deduplicate a repeated event", () => {
    const fake = withFakeBrowser();

    trackMetaPixel("Purchase", { value: 10 }, "order-1");

    expect(fake.fbq).toHaveBeenCalledWith(
      "track",
      "Purchase",
      { value: 10 },
      { eventID: "order-1" }
    );
  });

  it("omits the options argument when no eventID is given", () => {
    const fake = withFakeBrowser();

    trackMetaPixel("AddToCart", { value: 10 });

    expect(fake.fbq).toHaveBeenCalledWith("track", "AddToCart", { value: 10 });
  });

  it("sends a keyed event only once per session, so a refresh cannot re-fire Purchase", () => {
    const fake = withFakeBrowser();

    trackMetaPixelOnce("purchase:order-1", "Purchase", { value: 10 }, "order-1");
    trackMetaPixelOnce("purchase:order-1", "Purchase", { value: 10 }, "order-1");
    trackMetaPixelOnce("purchase:order-1", "Purchase", { value: 10 }, "order-1");

    expect(fake.fbq).toHaveBeenCalledTimes(1);
  });

  it("still tracks a genuinely different order", () => {
    const fake = withFakeBrowser();

    trackMetaPixelOnce("purchase:order-1", "Purchase", {}, "order-1");
    trackMetaPixelOnce("purchase:order-2", "Purchase", {}, "order-2");

    expect(fake.fbq).toHaveBeenCalledTimes(2);
  });

  it("does nothing when the pixel is blocked or missing", () => {
    vi.stubGlobal("window", { sessionStorage: undefined });

    expect(() => trackMetaPixel("PageView")).not.toThrow();
  });
});

describe("Meta Pixel wiring", () => {
  it("derives Purchase from the server action, never from the URL", () => {
    const checkoutPage = source("app/(store)/checkout/page.tsx");

    expect(checkoutPage).not.toContain("PurchasePixel");
    expect(checkoutPage).not.toContain("value?: string");
    expect(source("app/actions/checkout.ts")).toContain("buildPurchasePayload");
  });

  it("sends Purchase once per order with an eventID for deduplication", () => {
    const form = source("components/organisms/checkout-form.tsx");

    expect(form).toContain("trackMetaPixelOnce");
    expect(form).toContain("cartPixelPayload");
    expect(form).toContain("purchase:${purchase.orderId}");
    expect(form).toContain("purchase.orderId,");
    expect(form).not.toContain("&value=");
  });

  it("tracks PageView on query-string-only navigations", () => {
    const pixel = source("components/analytics/meta-pixel.tsx");

    expect(pixel).toContain("useSearchParams");
    // useSearchParams outside Suspense opts the whole app out of static rendering.
    expect(pixel).toContain("Suspense");
  });

  it("covers the standard ecommerce funnel", () => {
    const events = [
      ["PageView", "components/analytics/meta-pixel.tsx"],
      ["ViewContent", "components/analytics/meta-pixel.tsx"],
      ["ViewCategory", "components/analytics/meta-pixel.tsx"],
      ["Search", "components/analytics/meta-pixel.tsx"],
      ["AddToCart", "components/organisms/product-purchase.tsx"],
      ["InitiateCheckout", "components/organisms/checkout-form.tsx"],
      ["AddPaymentInfo", "components/organisms/checkout-form.tsx"],
      ["Purchase", "components/organisms/checkout-form.tsx"]
    ] as const;

    for (const [event, file] of events) {
      expect(source(file), `${event} should be tracked in ${file}`).toContain(`"${event}"`);
    }
  });

  it("allows the Meta Pixel hosts in the CSP", () => {
    const config = source("next.config.ts");

    expect(config).toContain("https://connect.facebook.net");
    expect(config).toContain("https://*.facebook.com");
    // Not a real Meta host; it only widened the policy.
    expect(config).not.toContain("https://www.facebook.net");
  });
});
