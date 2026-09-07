/**
 * Shared Meta Pixel payload builders.
 *
 * Framework-free on purpose: the server action, the client components and the
 * tests all build event payloads through here so a Purchase and an
 * InitiateCheckout can never disagree about how a cart is priced or shaped.
 */

export const PIXEL_CURRENCY = "USD";

type FbqFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

export type PixelContent = {
  id: string;
  quantity: number;
  item_price: number;
};

export type PixelLineItem = {
  productId: string;
  price: number;
  quantity: number;
};

export type PurchasePixelPayload = {
  orderId: string;
  value: number;
  currency: string;
  numItems: number;
  contentIds: string[];
  contents: PixelContent[];
};

export function roundCurrency(value: number) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function toPixelContents(items: PixelLineItem[]): PixelContent[] {
  return items.map((item) => ({
    id: item.productId,
    quantity: item.quantity,
    item_price: roundCurrency(item.price),
  }));
}

export function countPixelItems(items: PixelLineItem[]) {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function sumPixelValue(items: PixelLineItem[]) {
  return roundCurrency(
    items.reduce((total, item) => total + item.price * item.quantity, 0),
  );
}

/** Shared shape for AddToCart / InitiateCheckout / AddPaymentInfo. */
export function cartPixelPayload(items: PixelLineItem[]) {
  return {
    content_type: "product",
    content_ids: items.map((item) => item.productId),
    contents: toPixelContents(items),
    num_items: countPixelItems(items),
    value: sumPixelValue(items),
    currency: PIXEL_CURRENCY,
  };
}

/**
 * Built server-side only. `totalPrice` must be the server-priced order total
 * (items + shipping), never a value supplied by the client or the URL.
 */
export function buildPurchasePayload(
  orderId: string,
  items: PixelLineItem[],
  totalPrice: number,
): PurchasePixelPayload {
  return {
    orderId,
    value: roundCurrency(totalPrice),
    currency: PIXEL_CURRENCY,
    numItems: countPixelItems(items),
    contentIds: items.map((item) => item.productId),
    contents: toPixelContents(items),
  };
}

export function trackMetaPixel(
  event: string,
  data: Record<string, unknown> = {},
  eventId?: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  const fbq = window.fbq;

  if (!fbq) {
    return;
  }

  if (eventId) {
    fbq("track", event, data, { eventID: eventId });
    return;
  }

  fbq("track", event, data);
}

/**
 * Fires an event at most once per browser session for a given key, so a page
 * refresh, a back-navigation or a re-submit cannot re-send it. Purchase also
 * passes the order id as the Meta eventID, which deduplicates across devices
 * and against a future Conversions API integration.
 */
export function trackMetaPixelOnce(
  key: string,
  event: string,
  data: Record<string, unknown> = {},
  eventId?: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  const storageKey = `rawey-pixel:${key}`;

  try {
    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // sessionStorage can be unavailable (private mode); still send the event.
  }

  trackMetaPixel(event, data, eventId);
}
