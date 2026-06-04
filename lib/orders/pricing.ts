import { z } from "zod";
import { isAllowedProductSize } from "@/lib/product-variants";
import type { CartItem } from "@/types/cart";

export const MAX_CART_LINES = 25;
export const MAX_ITEM_QUANTITY = 20;

const cartLineSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(MAX_ITEM_QUANTITY)
});

const cartPayloadSchema = z.array(cartLineSchema).min(1).max(MAX_CART_LINES);

export type CanonicalCartLine = z.infer<typeof cartLineSchema>;

type ProductSummary = {
  id: string;
  name: string;
  brand: string;
  brand_slug?: string | null;
  image_url: string;
  slug?: string | null;
};

export type CanonicalVariant = {
  id: string;
  product_id: string;
  size_ml: number;
  price: number | string;
  product?: ProductSummary | ProductSummary[] | null;
};

export type CartParseResult =
  | { ok: true; items: CanonicalCartLine[] }
  | { ok: false; message: string };

export type CartPricingResult =
  | { ok: true; items: CartItem[]; subtotal: number }
  | { ok: false; message: string };

function getVariantProduct(variant: CanonicalVariant) {
  if (Array.isArray(variant.product)) {
    return variant.product[0] || null;
  }

  return variant.product || null;
}

export function parseCartPayload(payload: unknown): CartParseResult {
  const parsed = cartPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return { ok: false, message: "السلة تحتوي على بيانات غير صالحة." };
  }

  const merged = new Map<string, CanonicalCartLine>();

  for (const item of parsed.data) {
    const current = merged.get(item.variantId);

    if (!current) {
      merged.set(item.variantId, item);
      continue;
    }

    if (current.productId !== item.productId) {
      return { ok: false, message: "السلة تحتوي على منتج غير صالح." };
    }

    const quantity = current.quantity + item.quantity;

    if (quantity > MAX_ITEM_QUANTITY) {
      return { ok: false, message: `الحد الأقصى لكل منتج هو ${MAX_ITEM_QUANTITY}.` };
    }

    merged.set(item.variantId, { ...current, quantity });
  }

  return { ok: true, items: Array.from(merged.values()) };
}

export function priceCartItems(items: CanonicalCartLine[], variants: CanonicalVariant[]): CartPricingResult {
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  const pricedItems: CartItem[] = [];

  for (const item of items) {
    const variant = variantsById.get(item.variantId);

    if (!variant || variant.product_id !== item.productId || !isAllowedProductSize(variant.size_ml)) {
      return { ok: false, message: "أحد المنتجات في السلة لم يعد متوفراً." };
    }

    const product = getVariantProduct(variant);

    if (!product) {
      return { ok: false, message: "تعذر قراءة بيانات أحد المنتجات." };
    }

    const price = Number(variant.price);

    if (!Number.isFinite(price) || price <= 0) {
      return { ok: false, message: "تعذر قراءة سعر أحد المنتجات." };
    }

    pricedItems.push({
      productId: product.id,
      slug: product.slug,
      brandSlug: product.brand_slug,
      variantId: variant.id,
      name: product.name,
      brand: product.brand,
      imageUrl: product.image_url,
      sizeMl: variant.size_ml,
      price,
      quantity: item.quantity
    });
  }

  return {
    ok: true,
    items: pricedItems,
    subtotal: pricedItems.reduce((total, item) => total + item.price * item.quantity, 0)
  };
}
