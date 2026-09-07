"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const META_PIXEL_ID = "1782494246126807";

export function trackMetaPixel(
  event: string,
  data: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;

  if (!fbq) {
    return;
  }

  fbq("track", event, data);
}

export function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s){
            if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
          }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
          if (!window.fbq) {
            window.fbq = function() {
              (window.fbq.queue = window.fbq.queue || []).push(arguments);
            };
            window.fbq.queue = window.fbq.queue || [];
          }
          window.fbq('init', '${META_PIXEL_ID}');
        `}
      </Script>
      <MetaPixelPageView />
    </>
  );
}

function MetaPixelPageView() {
  const pathname = usePathname();

  useEffect(() => {
    trackMetaPixel("PageView");
  }, [pathname]);

  return null;
}

export function ProductViewContentPixel({
  productId,
  productName,
  productBrand,
  price,
  currency = "USD",
}: {
  productId: string;
  productName: string;
  productBrand: string;
  price: number;
  currency?: string;
}) {
  useEffect(() => {
    trackMetaPixel("ViewContent", {
      content_ids: [productId],
      content_name: productName,
      content_category: "product",
      content_type: "product",
      content_brand: productBrand,
      value: price,
      currency,
    });
  }, [currency, price, productBrand, productId, productName]);

  return null;
}

export function PurchasePixel({
  orderValue = 0,
  currency = "USD",
  orderId = "rawey-order",
}: {
  orderValue?: number;
  currency?: string;
  orderId?: string;
}) {
  useEffect(() => {
    trackMetaPixel("Purchase", {
      value: orderValue,
      currency,
      content_ids: [orderId],
      content_type: "product",
      content_name: "Rawey Order",
    });
  }, [currency, orderId, orderValue]);

  return null;
}

export function AddToCartPixel({
  productId,
  productName,
  quantity,
  price,
  currency = "USD",
}: {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  currency?: string;
}) {
  trackMetaPixel("AddToCart", {
    content_ids: [productId],
    content_name: productName,
    content_category: "product",
    content_type: "product",
    value: price * quantity,
    currency,
  });

  return null;
}
