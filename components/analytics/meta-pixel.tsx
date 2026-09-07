"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  PIXEL_CURRENCY,
  roundCurrency,
  trackMetaPixel,
} from "@/lib/analytics/pixel";

export const META_PIXEL_ID = "1782494246126807";

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
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" alt="" style="display:none" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" />`,
        }}
      />
      {/* useSearchParams() must sit inside Suspense or the whole app opts out of static rendering. */}
      <Suspense fallback={null}>
        <MetaPixelRouteTracker />
      </Suspense>
    </>
  );
}

/**
 * The base snippet fires the first PageView. This only covers client-side
 * navigations, including query-string-only changes such as ?search= or
 * ?success=, which a pathname-only effect would miss.
 */
function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    const key = query ? `${pathname}?${query}` : pathname;

    if (lastKey.current === null) {
      lastKey.current = key;
      return;
    }

    if (lastKey.current === key) {
      return;
    }

    lastKey.current = key;
    trackMetaPixel("PageView");
  }, [pathname, searchParams]);

  return null;
}

export function ProductViewContentPixel({
  productId,
  productName,
  productBrand,
  price,
  currency = PIXEL_CURRENCY,
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
      contents: [{ id: productId, quantity: 1, item_price: roundCurrency(price) }],
      value: roundCurrency(price),
      currency,
    });
  }, [currency, price, productBrand, productId, productName]);

  return null;
}

export function ViewCategoryPixel({
  categoryName,
  productIds,
}: {
  categoryName: string;
  productIds: string[];
}) {
  const ids = productIds.join(",");

  useEffect(() => {
    trackMetaPixel("ViewCategory", {
      content_name: categoryName,
      content_category: categoryName,
      content_type: "product",
      content_ids: ids ? ids.split(",") : [],
    });
  }, [categoryName, ids]);

  return null;
}

export function SearchPixel({
  searchString,
  productIds,
}: {
  searchString: string;
  productIds: string[];
}) {
  const ids = productIds.join(",");

  useEffect(() => {
    if (!searchString) {
      return;
    }

    trackMetaPixel("Search", {
      search_string: searchString,
      content_type: "product",
      content_ids: ids ? ids.split(",") : [],
    });
  }, [ids, searchString]);

  return null;
}
